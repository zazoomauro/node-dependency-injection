import path from 'path'
import ServiceFileNotAbsolute from './Exception/ServiceFileNotAbsolute'
import ServiceFileNotValidExtension from './Exception/ServiceFileNotValidExtension'
import YamlDumper from './Dump/YamlDumper'
import JsonDumper from './Dump/JsonDumper'
import JsDumper from './Dump/JsDumper'

export default class ServiceFile {
  constructor (
    servicesDumpPath
  ) {
    this.validExtensions = ['.yaml', '.yml', '.json', '.js']
    this.ensureAbsolutePathIsValid(servicesDumpPath)
    this.servicesDumpPath = servicesDumpPath
    this._content = { services: {} }
  }

  get content () {
    return this._content
  }

  get dumper () {
    const parsed = path.parse(this.servicesDumpPath)
    if (['.yaml', '.yml'].includes(parsed.ext)) {
      return new YamlDumper(this.servicesDumpPath, this._content)
    }

    if (['.json'].includes(parsed.ext)) {
      return new JsonDumper(this.servicesDumpPath, this._content)
    }

    if (['.js'].includes(parsed.ext)) {
      return new JsDumper(this.servicesDumpPath, this._content)
    }
  }

  /**
   * @private
   * @param {string} absolutePath
   */
  ensureAbsolutePathIsValid (absolutePath) {
    if (path.isAbsolute(absolutePath) === false) {
      throw new ServiceFileNotAbsolute(absolutePath)
    }

    const parsed = path.parse(absolutePath)
    if (this.validExtensions.includes(parsed.ext) === false) {
      throw new ServiceFileNotValidExtension(absolutePath)
    }
  }

  /**
   * @private
   * @param {ContainerBuilder} container
   */
  async _generateFromContainer (container) {
    for (const [id, definition] of container.definitions) {
      this._appendServicesToContent(id, definition, container.defaultDir)
    }
    for (const [id, reference] of container._alias) {
      this._content.services[id] = `@${reference}`
    }
    await this.dumper.dump()
  }

  _appendServicesToContent (id, definition, defaultDir = null) {
    const classPath = this._getClassPath(id, definition, defaultDir)
    const args = []
    for (const reference of definition.args) {
      args.push(`@${reference.id}`)
    }
    for (const appendReference of definition.appendArgs) {
      args.push(`@${appendReference.id}`)
    }
    this._content.services[id] = {
      class: classPath,
      arguments: args,
      abstract: definition.abstract,
      parent: definition.parent
    }
  }

  _getClassPath (id, definition, defaultDir = null) {
    let classPath = id.replace(/__/g, '/')
    const position = classPath.lastIndexOf(`/${definition._Object.name}`)
    classPath = classPath.substring(0, position)
    if (defaultDir) {
      return classPath.replace(defaultDir, '')
    }
    return classPath
  }
}
