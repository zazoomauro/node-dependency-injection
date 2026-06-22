import path from 'path'
import fs from 'fs'
import json5 from 'json5'
import { parse } from '@typescript-eslint/typescript-estree'
import Definition from './Definition'
import Reference from './Reference'
import AutowireIdentifier from './AutowireIdentifier'
import ContainerDefaultDirMustBeSet from './Exception/ContainerDefaultDirMustBeSet'
import PassConfig from './PassConfig'
import AutowireOverridePass from './CompilerPass/AutowireOverridePass'

export default class Autowire {
  /**
   * @param {ContainerBuilder} container
   * @param {string} tsConfigFullPath
   */
  constructor (container, tsConfigFullPath = null) {
    this._ensureContainerIsValidForAutowire(container)
    this._rootDirectory = container.defaultDir
    this._container = container
    this._excludedFolders = []
    this._serviceFile = null
    this._idStrategy = 'legacy'
    try {
      this._tsConfigFullPath = tsConfigFullPath || path.join(process.cwd(), 'tsconfig.json')
      this._tsConfigPaths = json5.parse(
        fs.readFileSync(this._tsConfigFullPath, 'utf-8')
      ).compilerOptions.paths
    } catch (e) {
      this._container.loggerHelper.debug(
        `Autowire: tsconfig.json not found or has no compilerOptions.paths at ${this._tsConfigFullPath}`
      )
      this._tsConfigPaths = null
    }
    this._container.autowire = this
  }

  _ensureContainerIsValidForAutowire (container) {
    if (container.defaultDir === null) {
      throw new ContainerDefaultDirMustBeSet()
    }
  }

  /**
   * @return {ContainerBuilder}
   */
  get container () {
    return this._container
  }

  /**
   * @private
   * @param {string}
   * @return {Iterable}
   */
  * _walk (dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        yield * this._walk(path.join(dir, file.name))
        continue
      }
      yield * this._walkFilePath(dir, file.name)
    }
  }

  /**
   * @param {string} dir
   * @param {string} fileName
   * @private
   */
  * _walkFilePath (dir, fileName) {
    try {
      const filePath = path.join(dir, fileName)
      this._ensureFileIsNotExcluded(filePath)
      yield filePath
    } catch (e) {
      this._container.loggerHelper.debug(`Autowire: skipping excluded file ${path.join(dir, fileName)}`)
    }
  }

  /**
   * @private
   * @param {string} filePath
   * @returns {void}
   */
  _ensureFileIsNotExcluded (filePath) {
    if (this._excludedFolders.some(excludedFolder => filePath.includes(excludedFolder))) {
      throw new Error('Excluded Folder!')
    }
  }

  /**
   * @param {string} path
   */
  addExclude (relativePath) {
    const fullPathToExclude = path.join(this._rootDirectory, relativePath)
    this._excludedFolders.push(fullPathToExclude)
  }

  /**
   * @private
   * @param {string} path
   * @param {string} type
   * @param {string} extension
   * @returns {Promise}
   */
  async _getServiceIdFromPath (path, type, extension = '.ts') {
    if (this._idStrategy === 'readable') {
      return AutowireIdentifier.toReadableId(path, this._rootDirectory, extension)
    }
    const readableId = path
      .replace(/\//g, '__')
      .replace(extension, '')
      .replace('@', '__')
      .concat(`__${type}`)
    return AutowireIdentifier.encode(readableId)
  }

  /**
   * @private
   * @param {string} absoluteFilePath
   * @param {string} type
   * @param {string} extension
   * @returns {Promise<string>}
   */
  async _getLegacyServiceId (absoluteFilePath, type, extension = '.ts') {
    const readableId = absoluteFilePath
      .replace(/\//g, '__')
      .replace(extension, '')
      .replace('@', '__')
      .concat(`__${type}`)
    return AutowireIdentifier.encode(readableId)
  }

  /**
   * @return {Promise}
   */
  async process () {
    this._container.loggerHelper.info(`Autowiring services from: ${this._rootDirectory}`)
    const promises = []
    for (const filePath of this._walk(this._rootDirectory)) {
      promises.push(this._executeFilePath(filePath))
    }
    await Promise.all(promises)
    this._container.loggerHelper.info('Autowire scan completed')
    this._container.addCompilerPass(
      new AutowireOverridePass(),
      PassConfig.TYPE_BEFORE_OPTIMIZATION
    )
  }

  /**
   * @param {string} filePath
   * @returns {Promise}
   * @private
   */
  async _executeFilePath (filePath) {
    const parsedFile = path.parse(filePath)
    if (parsedFile.ext !== '.ts') {
      this._container.loggerHelper.debug(`Autowire: skipping non-TypeScript file: ${filePath}`)
      return
    }
    const { classDeclaration, body } = await this._getClassDeclaration(filePath)
    if (!classDeclaration) {
      this._container.loggerHelper.debug(`Autowire: no default export class found in: ${filePath}`)
      return
    }
    const Class = require(filePath).default
    if (!Class) {
      this._container.loggerHelper.warn(
        `Autowire: file has export default declaration but no runtime default export: ${filePath}`
      )
      return
    }
    const importMap = this._buildImportMap(body)
    const definition = await this._getDefinition(
      classDeclaration,
      importMap,
      parsedFile,
      Class
    )
    if (!definition) {
      return
    }
    const serviceId = await this._getServiceIdFromPath(filePath, Class.name)
    this._container.loggerHelper.debug(`Autowire registering service: ${Class.name} (${serviceId})`)
    this.container.setDefinition(serviceId, definition)
    if (this._idStrategy === 'readable') {
      const legacyId = await this._getLegacyServiceId(filePath, Class.name)
      if (!this.container.hasAlias(legacyId) && !this.container.hasDefinition(legacyId)) {
        this.container.setAlias(legacyId, serviceId)
      }
    }
    await this._interfaceImplementations(classDeclaration, importMap, parsedFile, serviceId)
  }

  /**
   *
   * @param {string} filePath
   * @returns {Promise}
   * @private
   */
  async _getClassDeclaration (filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf8')
    const body = parse(sourceCode).body
    const classDeclaration = body.find(
      (declaration) => declaration.type === 'ExportDefaultDeclaration'
    )
    return { classDeclaration, body }
  }

  /**
   * @private
   * @param {Array} body
   * @returns {Map}
   */
  _buildImportMap (body) {
    const importMap = new Map()
    for (const declaration of body) {
      if (declaration.specifiers) {
        for (const specifier of declaration.specifiers) {
          importMap.set(specifier.local.name, declaration.source.value)
        }
      }
    }
    return importMap
  }

  /**
   *
   * @param {object} classDeclaration
   * @param {Map} importMap
   * @param {any} parsedFile
   * @param {any} ServiceClass
   * @returns
   * @private
   */
  async _getDefinition (classDeclaration, importMap, parsedFile, ServiceClass) {
    try {
      const definition = new Definition(ServiceClass)
      const constructorParams = await this._getConstructorParamsByDefinition(
        definition,
        classDeclaration,
        importMap,
        parsedFile
      )
      for (const parameterDeclaration of constructorParams) {
        const identifier = parameterDeclaration.parameter ?? parameterDeclaration
        const paramName = identifier.name
        if (paramName && this._container.binds.has(paramName)) {
          definition.addArgument(this._container.binds.get(paramName), definition.abstract)
          continue
        }
        const typeNameForArgument = identifier
          .typeAnnotation
          ?.typeAnnotation
          ?.typeName
          ?.name
        if (!typeNameForArgument) {
          this._container.loggerHelper.debug(
            `Autowire: skipping constructor parameter without type annotation in ${ServiceClass.name}`
          )
          continue
        }
        const argumentId = await this._getIdentifierFromImports(typeNameForArgument, importMap, parsedFile)
        if (!argumentId) {
          this._container.loggerHelper.warn(
            `Autowire: could not resolve dependency "${typeNameForArgument}" for service ${ServiceClass.name}. ` +
            'Ensure the import exists and points to a valid file.'
          )
          continue
        }
        definition.addArgument(new Reference(argumentId), definition.abstract)
      }
      return definition
    } catch (e) {
      this._container.loggerHelper.warn(
        `Autowire: failed to create definition for ${ServiceClass.name}: ${e.message}`
      )
    }
  }

  /**
   * @private
   * @param {Definition} definition
   * @param {object} classDeclaration
   * @param {any} body
   * @param {any} parsedFile
   * @returns
   */
  async _getConstructorParamsByDefinition (definition, classDeclaration, importMap, parsedFile) {
    const constructorDeclaration = classDeclaration.declaration.body.body.find(
      (method) => method.key.name === 'constructor'
    )
    if (classDeclaration.declaration.abstract) {
      definition.abstract = true
    }
    await this._parentDefinition(classDeclaration, importMap, parsedFile, definition)
    return constructorDeclaration ? constructorDeclaration.value.params : []
  }

  /**
   * @private
   * @param {object} classDeclaration
   * @param {any} body
   * @param {any} parsedFile
   * @param {Definition} definition
   */
  async _parentDefinition (classDeclaration, importMap, parsedFile, definition) {
    if (classDeclaration.declaration.superClass) {
      const typeParent = classDeclaration.declaration.superClass.name
      const parentId = await this._getIdentifierFromImports(
        typeParent,
        importMap,
        parsedFile
      )
      if (parentId) {
        definition.parent = parentId
      }
    }
  }

  /**
   * @private
   * @param {any} classDeclaration
   * @param {any} body
   * @param {any} parsedFile
   * @param {string} serviceId
   */
  async _interfaceImplementations (classDeclaration, importMap, parsedFile, serviceId) {
    const implementations = classDeclaration.declaration.implements ?? []
    for (const implement of implementations) {
      const interfaceType = implement.expression.name
      const aliasId = await this._getIdentifierFromImports(
        interfaceType,
        importMap,
        parsedFile
      )
      if (!aliasId || this.container.hasAlias(aliasId)) {
        continue
      }
      this._container.loggerHelper.debug(`Autowire aliasing interface: ${interfaceType} -> ${serviceId}`)
      this.container.setAlias(aliasId, serviceId)
    }
  }

  /**
   * @private
   * @param {string} type
   * @param {any} body
   * @param {anty} parsedFile
   * @returns {Promise}
   */
  async _getIdentifierFromImports (type, importMap, parsedFile) {
    try {
      let rootDir = parsedFile.dir
      let relativeImportForImplement = importMap.get(type)
      if (relativeImportForImplement === undefined) {
        return undefined
      }
      const configPaths = this._tsConfigPaths ?? []
      const hasAlias = relativeImportForImplement.startsWith('@')
      let aliasResolved = false
      for (const pathConfig in configPaths) {
        const tsConfigPath = pathConfig.replace(/\*/g, '')
        const tsRelativePath = this._tsConfigPaths[pathConfig][0].replace(/\*/g, '')
        if (!relativeImportForImplement.includes(tsConfigPath)) {
          continue
        }
        relativeImportForImplement = relativeImportForImplement.replace(
          tsConfigPath,
          tsRelativePath
        )
        const parsedTsConfigPath = path.parse(this._tsConfigFullPath)
        rootDir = parsedTsConfigPath.dir
        aliasResolved = true
      }
      if (hasAlias && !aliasResolved) {
        this._container.loggerHelper.debug(
          `Autowire: could not resolve tsconfig path alias for "${type}" (import: "${importMap.get(type)}")`
        )
        return undefined
      }
      const absolutePathImportForImplement = path.join(
        rootDir,
        relativeImportForImplement
      )
      return this._getServiceIdFromPath(absolutePathImportForImplement, type)
    } catch (e) {
      this._container.loggerHelper.warn(
        `Autowire: failed to resolve import identifier "${type}": ${e.message}`
      )
    }
  }

  /**
   * @param {ServiceFile} serviceFile
   */
  set serviceFile (serviceFile) {
    this._serviceFile = serviceFile
  }

  /**
   * @returns {ServiceFile}
   */
  get serviceFile () {
    return this._serviceFile
  }

  /**
   * Switch to the human-readable ID strategy.
   *
   * Service IDs will be derived from the path relative to `defaultDir`
   * (e.g. `src/Service/Mailer.ts` → `Service/Mailer`).
   * A legacy-format alias is also registered for backward compatibility.
   */
  makeIdReadable () {
    this._idStrategy = 'readable'
  }

  /**
   * Switch back to the legacy (Base64-encoded absolute path) ID strategy.
   * This is the default behaviour.
   */
  makeIdLegacy () {
    this._idStrategy = 'legacy'
  }

  /**
   * @returns {'legacy'|'readable'}
   */
  get idStrategy () {
    return this._idStrategy
  }
}
