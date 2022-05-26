import path from 'path'
import ServiceFileNotAbsolute from './Exception/ServiceFileNotAbsolute'
import ServiceFileNotValidExtension from './Exception/ServiceFileNotValidExtension'
import YamlDumper from './Dump/YamlDumper'
import JsonDumper from './Dump/JsonDumper'
import JsDumper from './Dump/JsDumper'
import AutowireIdentifier from './AutowireIdentifier'

export default class ServiceFile {
  constructor (
    servicesDumpPath,
    absolutePath = false
  ) {
    this.validExtensions = ['.yaml', '.yml', '.json', '.js']
    this._ensureAbsolutePathIsValid(servicesDumpPath)
    this._servicesDumpPath = servicesDumpPath
    this._absolutePath = absolutePath
    this._content = { services: {} }
  }

  /**
   * @private
   * @returns {YamlDumper|JsonDumper|JsDumper}
   */
  get _dumper () {
    const parsed = path.parse(this._servicesDumpPath)
    if (['.yaml', '.yml'].includes(parsed.ext)) {
      return new YamlDumper(this._servicesDumpPath, this._content)
    }

    if (['.json'].includes(parsed.ext)) {
      return new JsonDumper(this._servicesDumpPath, this._content)
    }

    if (['.js'].includes(parsed.ext)) {
      return new JsDumper(this._servicesDumpPath, this._content)
    }
  }

  /**
   * @private
   * @param {string} absolutePath
   */
  _ensureAbsolutePathIsValid (absolutePath) {
    if (path.isAbsolute(absolutePath) === false) {
      throw new ServiceFileNotAbsolute(absolutePath)
    }

    const parsed = path.parse(absolutePath)
    if (this.validExtensions.includes(parsed.ext) === false) {
      throw new ServiceFileNotValidExtension(absolutePath)
    }
  }

  /**
   * @param {ContainerBuilder} container
   */
  async generateFromContainer (container) {
    for (const [id, definition] of container.definitions) {
      this._appendServicesToContent(id, definition, container.defaultDir)
    }
    for (const [id, reference] of container._alias) {
      this._content.services[id] = `@${reference}`
    }
    await this._dumper.dump()
  }

  /**
   * @private
   * @param {string} id
   * @param {Definition} definition
   * @param {string} defaultDir
   */
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

  /**
   * @private
   * @param {string} id
   * @param {Definition} definition
   * @param {string} defaultDir
   * @returns {string}
   */
  _getClassPath (id, definition, defaultDir = null) {
    let classPath = AutowireIdentifier.decode(id).replace(/__/g, '/')
    const position = classPath.lastIndexOf(`/${definition._Object.name}`)
    classPath = classPath.substring(0, position)
    if (this._absolutePath === false && defaultDir) {
      return classPath.replace(defaultDir, '')
    }
    return classPath
  }
}
