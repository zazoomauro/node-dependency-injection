import path from 'path'
import fs from 'fs'
import json5 from 'json5'
import { parse } from '@typescript-eslint/typescript-estree'
import Definition from './Definition'
import Reference from './Reference'
import ServiceFile from './ServiceFile'

export default class Autowire {
  constructor (container, tsConfigFullPath = null) {
    this._interfaceImplementation = new Map()
    this._rootDirectory = container.defaultDir
    this._container = container
    this._excludedFolders = []
    this._dumpServiceFile = null
    try {
      this._tsConfigFullPath = tsConfigFullPath || path.join(process.cwd(), 'tsconfig.json')
      this._tsConfigPaths = json5.parse(
        fs.readFileSync(this._tsConfigFullPath, 'utf-8')
      ).compilerOptions.paths
    } catch (e) {
      this._tsConfigPaths = null
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
   */
  * _walkSync (dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        yield * this._walkSync(path.join(dir, file.name))
        continue
      }
      const filePath = path.join(dir, file.name)
      try {
        this._ensureFileIsNotExcluded(filePath)
        yield filePath
      } catch (e) {
      }
    }
  }

  /**
   * @private
   * @param {string} filePath
   * @returns {void}
   */
  _ensureFileIsNotExcluded (filePath) {
    this._excludedFolders.forEach(excludedFolder => {
      if (filePath.includes(excludedFolder)) {
        throw new Error('Excluded Folder!')
      }
    })
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
    return path
      .replace(/\//g, '__')
      .replace(extension, '')
      .replace('@', '__')
      .concat(`__${type}`)
  }

  /**
   * @return {Promise}
   */
  async process () {
    const promises = []
    for (const filePath of this._walkSync(this._rootDirectory)) {
      promises.push(this._executeFilePath(filePath))
    }
    await Promise.all(promises)
    if (this._dumpServiceFile instanceof ServiceFile) {
      await this._dumpServiceFile._generateFromContainer(this._container)
    }
  }

  /**
   * @param {string} filePath
   * @returns {Promise}
   * @private
   */
  async _executeFilePath (filePath) {
    const parsedFile = path.parse(filePath)
    if (parsedFile.ext !== '.ts') {
      return
    }
    const { classDeclaration, body } = await this._getClassDeclaration(filePath)
    if (!classDeclaration) {
      return
    }
    const Class = require(filePath).default
    if (!Class) {
      return
    }
    const definition = await this._getDefinition(
      classDeclaration,
      body,
      parsedFile,
      Class
    )
    if (!definition) {
      return
    }
    const serviceId = await this._getServiceIdFromPath(filePath, Class.name)
    this.container.setDefinition(serviceId, definition)
    await this._interfaceImplementations(classDeclaration, body, parsedFile, serviceId)
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
   *
   * @param {object} classDeclaration
   * @param {string} body
   * @param {any} parsedFile
   * @param {any} ServiceClass
   * @returns
   * @private
   */
  async _getDefinition (classDeclaration, body, parsedFile, ServiceClass) {
    try {
      const definition = new Definition(ServiceClass)
      const constructorParams = await this._getConstructorParamsByDefinition(
        definition,
        classDeclaration,
        body,
        parsedFile
      )
      for (const parameterDeclaration of constructorParams) {
        const typeNameForArgument = parameterDeclaration
          .parameter
          .typeAnnotation
          .typeAnnotation
          .typeName
          .name
        const argumentId = await this._getIdentifierFromImports(typeNameForArgument, body, parsedFile)
        if (!argumentId) {
          continue
        }
        definition.addArgument(new Reference(argumentId), definition.abstract)
      }
      return definition
    } catch (e) {
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
  async _getConstructorParamsByDefinition (definition, classDeclaration, body, parsedFile) {
    const constructorDeclaration = classDeclaration.declaration.body.body.find(
      (method) => method.key.name === 'constructor'
    )
    if (classDeclaration.declaration.abstract) {
      definition.abstract = true
    }
    await this._parentDefinition(classDeclaration, body, parsedFile, definition)
    const constructorParams = constructorDeclaration ? constructorDeclaration.value.params : []
    return constructorParams
  }

  /**
   * @private
   * @param {object} classDeclaration
   * @param {any} body
   * @param {any} parsedFile
   * @param {Definition} definition
   */
  async _parentDefinition (classDeclaration, body, parsedFile, definition) {
    if (classDeclaration.declaration.superClass) {
      const typeParent = classDeclaration.declaration.superClass.name
      const parentId = await this._getIdentifierFromImports(
        typeParent,
        body,
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
  async _interfaceImplementations (classDeclaration, body, parsedFile, serviceId) {
    const implementations = classDeclaration.declaration.implements ?? []
    for (const implement of implementations) {
      const interfaceType = implement.expression.name
      const aliasId = await this._getIdentifierFromImports(
        interfaceType,
        body,
        parsedFile
      )
      if (!aliasId || this.container.hasAlias(aliasId)) {
        continue
      }
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
  async _getIdentifierFromImports (type, body, parsedFile) {
    try {
      let rootDir = parsedFile.dir
      let relativeImportForImplement = await this._getRelativeImport(body, type)
      const configPaths = this._tsConfigPaths ?? []
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
      }
      const absolutePathImportForImplement = path.join(
        rootDir,
        relativeImportForImplement
      )
      return this._getServiceIdFromPath(absolutePathImportForImplement, type)
    } catch (e) {
    }
  }

  /**
   * @private
   * @param {any} body
   * @param {string} type
   * @returns {Promise}
   */
  async _getRelativeImport (body, type) {
    return body.find((declaration) => {
      if (declaration.specifiers) {
        return declaration.specifiers.find((specifier) => {
          return specifier.local.name === type
        })
      }
      return null
    }).source.value
  }

  enableDump(servicesDumpPath) {
    this._dumpServiceFile = new ServiceFile(servicesDumpPath)
  }
}
