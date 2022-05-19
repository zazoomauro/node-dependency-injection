import path from 'path'
import fs from 'fs'
import json5 from 'json5'
import { parse } from '@typescript-eslint/typescript-estree'
import Definition from './Definition'
import Reference from './Reference'

export default class Autowire {
  constructor (container, tsConfigFullPath = null) {
    this._interfaceImplementation = new Map()
    this._rootDirectory = container.defaultDir
    this._container = container
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

  * _walkSync (dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        yield * this._walkSync(path.join(dir, file.name))
      } else {
        yield path.join(dir, file.name)
      }
    }
  }

  async _getServiceIdFromPath (path, type, extension = '.ts') {
    return path
      .replace(/\//g, '_')
      .replace(extension, '')
      .replace('@', '_')
      .concat(`_${type}`)
  }

  async process () {
    const promises = []
    for (const filePath of this._walkSync(this._rootDirectory)) {
      promises.push(this._executeFilePath(filePath))
    }
    await Promise.all(promises)
  }

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

  async _getClassDeclaration (filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf8')
    const body = parse(sourceCode).body
    const classDeclaration = body.find(
      (declaration) => declaration.type === 'ExportDefaultDeclaration'
    )
    return { classDeclaration, body }
  }

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
        const argumentId = await this._getIdentifierFromImports(
          typeNameForArgument,
          body,
          parsedFile
        )
        if (!argumentId) {
          continue
        }
        definition.addArgument(new Reference(argumentId), definition.abstract)
      }
      return definition
    } catch (e) {
    }
    return null
  }

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

  async _getIdentifierFromImports (type, body, parsedFile) {
    try {
      let rootDir = parsedFile.dir
      let relativeImportForImplement = await this._getRelativeImport(body, type)
      const configPaths = this._tsConfigPaths ?? []
      for (const pathConfig in configPaths) {
        const tsConfigPath = pathConfig.replace(/\*/g, '')
        let tsRelativePath = this._tsConfigPaths[pathConfig][0]
        tsRelativePath = tsRelativePath.replace(/\*/g, '')
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
      return this._getServiceIdFromPath(
        absolutePathImportForImplement,
        type
      )
    } catch (e) {
    }
    return null
  }

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
}
