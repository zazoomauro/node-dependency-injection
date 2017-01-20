import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'

class ContainerBuilder {

  constructor () {
    this._definitions = new Map()
  }

  /**
   * @param {string|number} id
   * @param {*} className
   * @param {Array} args
   * @returns {Definition}
   */
  register (id, className, args = []) {
    let definition = new Definition(className, args)
    this._definitions.set(id, definition)

    return definition
  }

  /**
   * @param {string} id
   */
  get (id) {
    let definition = this._definitions.get(id)

    if (definition) {
      return this.getInstanceFromDefinition(definition)
    }

    throw new Error('The service ' + id + ' is not registered')
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   */
  getInstanceFromDefinition (definition) {
    let args = this.resolveArguments(definition.arguments)
    let service = new definition.Object(...args)

    for (let call of definition.calls) {
      this.callMethod(service, call)
    }

    return service
  }

  /**
   * @param {*} service
   * @param {{method, args}} call
   */
  callMethod (service, call) {
    if (typeof service[call.method] !== 'function') {
      return
    }

    let args = this.resolveArguments(call.args)

    service[call.method](...args)
  }

  /**
   * @param {Array} args
   * @returns {Array}
   */
  resolveArguments (args) {
    let resolvedArgument = []

    for (let argument of args) {
      resolvedArgument.push(this.resolveServices(argument))
    }

    return resolvedArgument
  }

  /**
   * @param {Reference|PackageReference|*} value
   * @returns {*}
   */
  resolveServices (value) {
    if (value instanceof Reference) {
      return this.get(value.id)
    } else if (value instanceof PackageReference) {
      return require(value.id)
    } else {
      return value
    }
  }
}

export default ContainerBuilder
