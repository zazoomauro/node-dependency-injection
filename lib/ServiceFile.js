import path from 'path'
import ServiceFileNotAbsolute from './Exception/ServiceFileNotAbsolute'
import ServiceFileNotValidExtension from './Exception/ServiceFileNotValidExtension'
import YamlDumper from './Dump/YamlDumper'
import JsonDumper from './Dump/JsonDumper'
import JsDumper from './Dump/JsDumper'
import XmlDumper from './Dump/XmlDumper'
import AutowireIdentifier from './AutowireIdentifier'
import Reference from './Reference'
import ParameterReference from './ParameterReference'
import PackageReference from './PackageReference'
import TagReference from './TagReference'

export default class ServiceFile {
  constructor (
    servicesDumpPath,
    absolutePath = false
  ) {
    this.validExtensions = ['.yaml', '.yml', '.json', '.js', '.xml']
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

    if (['.xml'].includes(parsed.ext)) {
      return new XmlDumper(this._servicesDumpPath, this._content)
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
    if (definition.synthetic) {
      this._content.services[id] = { synthetic: true }
      return
    }

    const classPath = this._getClassPath(id, definition, defaultDir)
    const service = {
      class: classPath,
      arguments: definition.args.map((arg) => this._serializeArg(arg))
    }

    if (definition.appendArgs.length > 0) {
      service.arguments = service.arguments.concat(
        definition.appendArgs.map((arg) => this._serializeArg(arg))
      )
    }

    if (definition.abstract) {
      service.abstract = true
    }

    if (definition.parent !== undefined && definition.parent !== null) {
      service.parent = definition.parent
    }

    if (definition.lazy) {
      service.lazy = true
    }

    if (!definition.public) {
      service.public = false
    }

    if (!definition.shared) {
      service.shared = false
    }

    if (definition.deprecated) {
      service.deprecated = definition.deprecated
    }

    if (definition.decoratedService) {
      service.decorates = definition.decoratedService
    }

    if (definition.decorationPriority !== null && definition.decorationPriority !== undefined) {
      service.decoration_priority = definition.decorationPriority
    }

    if (definition.tags.length > 0) {
      service.tags = definition.tags.map((tag) => {
        const result = { name: tag.name }
        if (tag.attributes && tag.attributes.size > 0) {
          const attrs = {}
          for (const [k, v] of tag.attributes) {
            attrs[k] = v
          }
          result.attributes = attrs
        }
        return result
      })
    }

    if (definition.calls.length > 0) {
      service.calls = definition.calls.map((call) => ({
        method: call.method,
        arguments: call.args.map((arg) => this._serializeArg(arg))
      }))
    }

    if (definition.properties.size > 0) {
      service.properties = {}
      for (const [key, value] of definition.properties) {
        service.properties[key] = this._serializeArg(value)
      }
    }

    if (definition.factory) {
      const factoryObj = definition.factory.Object
      const factoryClass = factoryObj instanceof Reference
        ? `@${factoryObj.id}`
        : null
      if (factoryClass !== null) {
        service.factory = { class: factoryClass, method: definition.factory.method }
      }
    }

    this._content.services[id] = service
  }

  /**
   * Serialize a single argument back to its string/value representation.
   *
   * @private
   * @param {*} arg
   * @returns {string|boolean}
   */
  _serializeArg (arg) {
    if (arg instanceof TagReference) {
      return `!tagged ${arg.name}`
    }
    if (arg instanceof Reference) {
      return arg.nullable ? `@?${arg.id}` : `@${arg.id}`
    }
    if (arg instanceof ParameterReference) {
      return `%${arg.key}%`
    }
    if (arg instanceof PackageReference) {
      return `%${arg.id}`
    }
    return arg
  }

  /**
   * @private
   * @param {string} id
   * @param {Definition} definition
   * @param {string} defaultDir
   * @returns {string}
   */
  _getClassPath (id, definition, defaultDir = null) {
    if (!AutowireIdentifier.isLegacyId(id)) {
      // Readable ID: the id is already a relative path (e.g. 'Service/Mailer')
      if (this._absolutePath && defaultDir) {
        return path.join(defaultDir, id)
      }
      return `/${id}`
    }

    let classPath = AutowireIdentifier.decode(id).replace(/__/g, '/')
    const position = classPath.lastIndexOf(`/${definition._Object.name}`)
    classPath = classPath.substring(0, position)
    if (this._absolutePath === false && defaultDir) {
      return classPath.replace(defaultDir, '')
    }
    return classPath
  }
}
