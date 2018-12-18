import path from 'path'
import Reference from './../Reference'
import PackageReference from './../PackageReference'
import Definition from './../Definition'

class FileLoader {
  /**
   * @param {ContainerBuilder} container
   */
  constructor (container) {
    this._container = container
  }

  /**
   * @param {string} file
   * @protected
   */
  _checkFile (file) {
    this.filePath = file
  }

  /**
   * @returns {ContainerBuilder}
   */
  get container () {
    return this._container
  }

  /**
   * @returns {string}
   */
  get filePath () {
    return this._filePath
  }

  /**
   * @param {string} value
   */
  set filePath (value) {
    this._filePath = value
  }

  /**
   * @param {Array<*>} services
   *
   * @protected
   */
  _parseDefinitions (services = []) {
    for (let id in services) {
      if (services.hasOwnProperty(id)) {
        this._parseDefinition(services, id)
      }
    }
  }

  /**
   * @param {*} services
   * @param {string} id
   * @private
   */
  _parseDefinition (services, id) {
    let service = services[id]

    if (typeof service === 'string') {
      this.container.setAlias(id, service.slice(1))
    } else if (service.factory) {
      this.container.setDefinition(id, this._getFactoryDefinition(service))
    } else {
      this.container.setDefinition(id, this._getDefinition(service))
    }
  }

  /**
   * @param {*} service
   * @returns {Definition}
   * @private
   */
  _getFactoryDefinition (service) {
    let object = null

    if (service.factory.class.includes('@', 0)) {
      object = new Reference(service.factory.class.slice(1))
    } else {
      object = this._requireClassNameFromPath(service.factory.class)
    }

    let definition = new Definition()
    definition.shared = service.shared
    definition.setFactory(object, service.factory.method)
    definition.args = this._getParsedArguments(service.arguments)

    return definition
  }

  /**
   * @param {*} service
   * @returns {Definition}
   * @private
   */
  _getDefinition (service) {
    let definition

    if (!service.synthetic) {
      let object = this._requireClassNameFromPath(service.class)
      definition = new Definition(object)
      definition.lazy = service.lazy || false
      definition.public = service.public !== false
      definition.abstract = service.abstract || false
      definition.parent = service.parent
      definition.decoratedService = service.decorates
      definition.decorationPriority = service.decoration_priority
      definition.deprecated = service.deprecated
      definition.shared = service.shared

      this._parseArguments(definition, service.arguments)
      this._parseProperties(definition, service.properties)
      this._parseCalls(definition, service.calls)
      this._parseTags(definition, service.tags)
    } else {
      definition = new Definition()
      definition.synthetic = true
    }

    return definition
  }

  /**
   * @param {Definition} definition
   * @param {Array} calls
   * @private
   */
  _parseCalls (definition, calls = []) {
    calls.map((call) => {
      definition.addMethodCall(call.method,
        this._getParsedArguments(call.arguments))
    })
  }

  /**
   * @param {Definition} definition
   * @param {Array} tags
   * @private
   */
  _parseTags (definition, tags = []) {
    tags.map((tag) => {
      definition.addTag(tag.name,
        FileLoader._parseTagAttributes(tag.attributes))
    })
  }

  /**
   * @param {Array} args
   * @returns {Array}
   * @private
   */
  _getParsedArguments (args = []) {
    let parsedArguments = []
    args.map((argument) => {
      parsedArguments.push(this._parseArgument(argument))
    })

    return parsedArguments
  }

  /**
   * @param {*} attributes
   * @returns Map
   * @private
   */
  static _parseTagAttributes (attributes) {
    let map = new Map()

    if (attributes) {
      for (let key of Object.keys(attributes)) {
        map.set(key, attributes[key])
      }
    }

    return map
  }

  /**
   * @param {Definition} definition
   * @param {Object} properties
   * @private
   */
  _parseProperties (definition, properties = {}) {
    for (let propertyKey in properties) {
      if (properties.hasOwnProperty(propertyKey)) {
        definition.addProperty(propertyKey,
          this._parseArgument(properties[propertyKey]))
      }
    }
  }

  /**
   * @param {Array<{resource}>} imports
   *
   * @protected
   */
  _parseImports (imports = []) {
    for (let file of imports) {
      const workingPath = this.filePath
      this.load(path.join(path.dirname(this.filePath), file.resource))
      this.filePath = workingPath
    }
  }

  /**
   * @param {*} parameters
   *
   * @protected
   */
  _parseParameters (parameters = {}) {
    for (let key in parameters) {
      if (parameters.hasOwnProperty(key)) {
        this._container.setParameter(key, parameters[key])
      }
    }
  }

  /**
   * @param {Definition} definition
   * @param {Array} args
   *
   * @private
   */
  _parseArguments (definition, args = []) {
    const argument = (definition.abstract) ? 'appendArgs' : 'args'
    definition[argument] = this._getParsedArguments(args)
  }

  /**
   * @param {string} argument
   * @returns {*}
   *
   * @private
   */
  _parseArgument (argument) {
    if (typeof argument === 'boolean') {
      return argument
    }

    if (argument.slice(0, 2) === '@?') {
      return new Reference(argument.slice(2), true)
    } else if (argument.slice(0, 1) === '@') {
      return new Reference(argument.slice(1))
    } else if (argument.slice(0, 1) === '%' && argument.slice(-1) === '%') {
      return this._container.getParameter(argument.slice(1, -1))
    } else if (argument.slice(0, 1) === '%') {
      return new PackageReference(argument.slice(1))
    }

    return argument
  }

  /**
   * @param {string} classObject
   * @returns {*}
   *
   * @private
   */
  _requireClassNameFromPath (classObject) {
    let fromDirectory = (!path.isAbsolute(classObject))
      ? path.dirname(this.filePath) : '/'
    return require(path.join(fromDirectory, classObject)).default
  }
}

export default FileLoader
