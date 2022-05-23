import path from 'path'
import ServiceFileNotAbsolute from './Exception/ServiceFileNotAbsolute'
import ServiceFileNotValidExtension from './Exception/ServiceFileNotValidExtension'
import ContainerBuilder from './ContainerBuilder'
import YamlDumper from './Dump/YamlDumper'
import JsonDumper from './Dump/JsonDumper'
import JsDumper from './Dump/JsDumper'

export default class ServiceFile {
  constructor(
    absolutePath,
  ) {
    this.validExtensions = ['.yaml', '.yml', '.json', '.js']
    this.ensureAbsolutePathIsValid(absolutePath)
    this.absolutePath = absolutePath
    this._content = { services: {} }
  }

  get content() {
    return this._content
  }

  get dumper() {
    const parsed = path.parse(this.absolutePath)
    if (['.yaml', '.yml'].includes(parsed.ext)) {
      return new YamlDumper(this.absolutePath, this._content)
    }

    if (['.json'].includes(parsed.ext)) {
      return new JsonDumper(this.absolutePath, this._content)
    }

    if (['.js'].includes(parsed.ext)) {
      return new JsDumper(this.absolutePath, this._content)
    }
  }

  /**
   * @private
   * @param {string} absolutePath 
   */
  ensureAbsolutePathIsValid(absolutePath) {
    if (false === path.isAbsolute(absolutePath)) {
      throw new ServiceFileNotAbsolute(absolutePath)
    }

    const parsed = path.parse(absolutePath)
    if (false === this.validExtensions.includes(parsed.ext)) {
      throw new ServiceFileNotValidExtension(absolutePath)
    }
  }

  /**
   * @private
   * @param {ContainerBuilder} container 
   */
  async _generateFromContainer(container) {
    for (const [id, definition] of container.definitions) {
      this._appendServicesToContent(id, definition) 
    }
    for (const [id, reference] of container._alias) {
      this._content.services[id] = `@${reference}`
    }
    await this.dumper.dump()
  }

  _appendServicesToContent(id, definition) {
    let classPath = this._getClassPath(id, definition)
    const args = []
    for (const reference of definition.args) {
      args.push(`@${reference.id}`)
    }
    this._content.services[id] = {
      class: classPath,
      arguments: args,
      abstract: definition.abstract,
      parent: definition.parent,
    }
  }

  _getClassPath(id, definition) {
    let classPath = id.replace(/__/g, '/')
    const position = classPath.lastIndexOf(`/${definition._Object.name}`)
    classPath = classPath.substring(0, position)
    return classPath
  }
}
