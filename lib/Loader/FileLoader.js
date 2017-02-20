import path from 'path'
import Reference from './../Reference'
import PackageReference from './../PackageReference'

class FileLoader {

  /**
   * @param {ContainerBuilder} container
   * @param {string} filePath
   */
  constructor (container, filePath) {
    this._container = container
    this._filePath = filePath
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
          let definition = this.container.register(id, object)
          let args = (services[id].arguments) ? services[id].arguments : []
          let calls = (services[id].calls) ? services[id].calls : []
          let tags = (services[id].tags) ? services[id].tags : []

          definition.args = this._parseArguments(args)

          for (let call of calls) {
            let callArgs = (call.arguments) ? call.arguments : []
            definition.addMethodCall(call.method, this._parseArguments(callArgs))
          }

          for (let tag of tags) {
            definition.addTag(tag.name)
          }
        }
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
      this.load(file.resource)
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
   * @param {Array} args
   * @returns {Array}
   *
   * @private
   */
  _parseArguments (args) {
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
