import path from 'path'
import Reference from './../Reference'
import PackageReference from './../PackageReference'
import Definition from './../Definition'

class FileLoader {

  /**
   * @param {ContainerBuilder} container
   * @param {string|null} filePath
   */
  constructor (container, filePath = null) {
    this._container = container
    if (filePath) {
      console.warn('DEPRECATED',
        'The second argument in the FileLoader is deprecated. Please send the file path in the load method instead.'
      )
      this._filePath = filePath
    }
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
        if (typeof services[id] === 'string') {
          this.container.setAlias(id, services[id].slice(1))
        } else {
          let object = this._requireClassNameFromPath(services[id].class)
          let definition = new Definition(object)
          definition.lazy = services[id].lazy || false

          this._parseArguments(definition, services[id].arguments)
          this._parseProperties(definition, services[id].properties)
          this._parseCalls(definition, services[id].calls)
          this._parseTags(definition, services[id].tags)

          this.container.setDefinition(id, definition)
        }
      }
    }
  }

  /**
   * @param {Definition} definition
   * @param {Array} calls
   * @private
   */
  _parseCalls (definition, calls = []) {
    for (let call of calls) {
      definition.addMethodCall(call.method, this._getParsedArguments(call.arguments))
    }
  }

  /**
   * @param {Definition} definition
   * @param {Array} tags
   * @private
   */
  _parseTags (definition, tags = []) {
    for (let tag of tags) {
      definition.addTag(tag.name)
    }
  }

  /**
   * @param {Definition} definition
   * @param {Object} properties
   * @private
   */
  _parseProperties (definition, properties = {}) {
    for (let propertyKey in properties) {
      if (properties.hasOwnProperty(propertyKey)) {
        definition.addProperty(propertyKey, this._parseArgument(properties[propertyKey]))
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
      this.load(path.join(path.dirname(this.filePath), file.resource))
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
    definition.args = this._getParsedArguments(args)
  }

  /**
   * @param {Array} args
   * @returns {Array}
   * @private
   */
  _getParsedArguments (args = []) {
    let parsedArguments = []

    for (let argument of args) {
      parsedArguments.push(this._parseArgument(argument))
    }

    return parsedArguments
  }

  /**
   * @param {string} argument
   * @returns {*}
   *
   * @private
   */
  _parseArgument (argument) {
    if (argument.includes('@', 0)) {
      return new Reference(argument.slice(1))
    } else if (argument.includes('%', 0) && argument.slice(-1) === '%') {
      return this._container.getParameter(argument.slice(1, -1))
    } else if (argument.includes('%', 0)) {
      return new PackageReference(argument.slice(1))
    }

    return argument
  }

  /**
   * @param {Object|string} classObject
   * @returns {*}
   *
   * @private
   */
  _requireClassNameFromPath (classObject) {
    let fromDirectory = path.dirname(this.filePath)
    let filePath = fromDirectory + path.sep + classObject.replace(/^.\//, '')

    return require(filePath).default
  }
}

export default FileLoader
