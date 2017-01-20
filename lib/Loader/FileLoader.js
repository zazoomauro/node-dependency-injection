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
   */
  parseDefinitions (services) {
    for (let i in services) {
      if (services.hasOwnProperty(i)) {
        let object = this.requireClassNameFromPath(services[i].class)
        let definition = this.container.register(i, object)
        let args = (services[i].arguments) ? services[i].arguments : []
        let calls = (services[i].calls) ? services[i].calls : []

        definition.setArguments(this.parseArguments(args))

        for (let call of calls) {
          let callArgs = (call.arguments) ? call.arguments : []
          definition.addMethodCall(call.method, this.parseArguments(callArgs))
        }
      }
    }
  }

  /**
   * @param {Array} args
   * @returns {Array}
   */
  parseArguments (args) {
    let parsedArguments = []

    for (let argument of args) {
      parsedArguments.push(this.parseArgument(argument))
    }

    return parsedArguments
  }

  /**
   * @param {string} argument
   * @returns {*}
   */
  parseArgument (argument) {
    if (argument.includes('@', 0)) {
      return new Reference(argument.slice(1))
    } else if (argument.includes('%', 0)) {
      return new PackageReference(argument.slice(1))
    }

    return argument
  }

  /**
   * @param {Object|string} classObject
   * @returns {*}
   */
  requireClassNameFromPath (classObject) {
    let fromDirectory = path.dirname(this.filePath)
    let filePath

    if (typeof classObject === 'object') {
      filePath = fromDirectory + path.sep + classObject.file.replace(/^.\//, '')

      return require(filePath)[classObject.name]
    }

    filePath = fromDirectory + path.sep + classObject.replace(/^.\//, '')

    return require(filePath).default
  }
}

export default FileLoader
