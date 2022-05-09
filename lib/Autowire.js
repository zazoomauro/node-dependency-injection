import path from 'path'
import fs from 'fs'
import { parse } from '@typescript-eslint/parser'
import Definition from './Definition'
import Reference from './Reference'
import MultipleInterfaceImplementation from './Exception/MultipleInterfaceImplementation'

export default class Autowire {
  _interfaceImplementation = new Map()

  constructor (container) {
    this._rootDirectory = container.defaultDir
    this._container = container
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

  _getServiceIdFromPath (path, type, extension = '.ts') {
    return path
      .replace(/\//g, '_')
      .replace(extension, '')
      .concat(`_${type}`)
  }

  /**
   * @returns {void}
   */
  async process () {
    for (const filePath of this._walkSync(this._rootDirectory)) {
      const parsedFile = path.parse(filePath)
      if (parsedFile.ext === '.ts') {
        const { classDeclaration, body } = this._getClassDeclaration(filePath)
        const Class = require(filePath).default
      
        if (Class && classDeclaration) {
          const definition = this._getDefinition(
            classDeclaration, 
            body, 
            parsedFile, 
            Class
          )

          const serviceId = this._getServiceIdFromPath(filePath, Class.name)
          this.container.setDefinition(serviceId, definition)
          
          this._interfaceImplementations(classDeclaration, body, parsedFile, serviceId)
        }
      }
    }
  }

  _getClassDeclaration(filePath) {
    const sourceCode = fs.readFileSync(filePath, 'utf8')
    const body = parse(sourceCode).body
    const classDeclaration = body.find(
      (declaration) => declaration.type === 'ExportDefaultDeclaration'
    )
    return { classDeclaration, body }
  }

  _getDefinition(classDeclaration, body, parsedFile, ServiceClass) {
    const definition = new Definition(ServiceClass)
    const constructorDeclaration = classDeclaration.declaration.body.body.find(
      (method) => method.key.name === 'constructor'
    )
    if (classDeclaration.declaration.abstract) {
      definition.abstract = true
    }
    if (classDeclaration.declaration.superClass) {
      const typeParent = classDeclaration.declaration.superClass.name
      const parentId = this._getIdentifierFromImports(
        typeParent,
        body,
        parsedFile,
      )
      definition.parent = parentId
    }
    if (constructorDeclaration) {
      for (const parameterDeclaration of constructorDeclaration.value.params) {
        const typeNameForArgument = parameterDeclaration
          .parameter
          .typeAnnotation
          .typeAnnotation
          .typeName
          .name
        const argumentId = this._getIdentifierFromImports(
          typeNameForArgument,
          body,
          parsedFile,
        )
        definition.addArgument(new Reference(argumentId), definition.abstract)
      }
    }
    return definition
  }

  _interfaceImplementations(classDeclaration, body, parsedFile, serviceId) {
    if (classDeclaration.declaration.implements) {
      for (let implement of classDeclaration.declaration.implements) {
        const interfaceType = implement.expression.name
        const aliasId = this._getIdentifierFromImports(interfaceType, body, parsedFile)
        if (false === this.container.hasAlias(aliasId)) {
          this.container.setAlias(aliasId, serviceId)
        }
      }
    }
  }

  _getIdentifierFromImports(type, body, parsedFile) {
    const relativeImportForImplement = body.find(
      (declaration) => {
        if (declaration.specifiers) {
          for (let specifier of declaration.specifiers) {
            return specifier.local.name === type
          }
        }
      }
    ).source.value
    const absolutePathImportForImplement = path.join(
      parsedFile.dir,
      relativeImportForImplement
    )
    return this._getServiceIdFromPath(
      absolutePathImportForImplement,
      type,
    )
  }
}
