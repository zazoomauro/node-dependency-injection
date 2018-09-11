import Reference from './Reference'
import PackageReference from './PackageReference'
import PrivateServiceException from './Exception/PrivateServiceException'
import ServiceNotFoundException from './Exception/ServiceNotFoundException'
import NotAbstractServiceException from './Exception/NotAbstractServiceException'
import MethodCallNotFoundException from './Exception/MethodCallNotFoundException'
import AbstractServiceException from './Exception/AbstractServiceException'

export default class InstanceManager {
  /**
   * @param {ContainerBuilder} containerBuilder
   * @param {Map} definitions
   * @param {Map} alias
   */
  constructor (containerBuilder, definitions, alias) {
    this._containerBuilder = containerBuilder
    this._definitions = definitions
    this._alias = alias
  }

  /**
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {*}
   */
  getInstance (id, bypassPublic = false) {
    id = this._alias.get(id) || id

    if (id === 'service_container') {
      return this._containerBuilder;
    }

    if (this._definitions.has(id)) {
      return this._getInstanceFromId(id, bypassPublic)
    }

    throw new ServiceNotFoundException(id)
  }

  /**
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {*}
   * @private
   */
  _getInstanceFromId (id, bypassPublic = false) {
    const definition = this._definitions.get(id)

    if (!definition.public && !bypassPublic) {
      throw new PrivateServiceException(id)
    }

    if (definition.abstract) {
      throw new AbstractServiceException(id)
    }

    if (definition.deprecated) {
      this._containerBuilder.logger.warn('DEPRECATED', definition.deprecated)
    }

    if ((definition.Object) || definition.factory ||
      (!definition.Object && definition.synthetic)) {
      return this._getExistingInstanceFromId(id, bypassPublic)
    }

    throw new ServiceNotFoundException(id)
  }

  /**
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {*}
   * @private
   */
  _getExistingInstanceFromId (id, bypassPublic = false) {
    const definition = this._definitions.get(id)

    if (definition.shared === false) {
      return this.getInstanceFromDefinition(definition)
    }

    if (this._containerBuilder.services.has(id) &&
      definition.isPublic(bypassPublic)) {
      return this._containerBuilder.services.get(id)
    }

    let instance = this.getInstanceFromDefinition(definition)
    this._containerBuilder.services.set(id, instance)

    return instance
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   */
  getInstanceFromDefinition (definition) {
    if (definition.factory) {
      return this._getInstanceFromFactory(definition)
    }

    if (!definition.synthetic) {
      return this._getNotSyntheticInstanceFromDefinition(definition)
    }
  }

  /**
   * @param {Definition} definition
   * @return {*}
   * @private
   */
  _getNotSyntheticInstanceFromDefinition (definition) {
    let args = this._resolveArguments(definition.args)

    if (definition.parent) {
      args = this._appendParentArgumentsFromDefinition(definition, args)
    }

    const instance = new definition.Object(...args)

    for (let [key, value] of definition.properties) {
      instance[key] = this._resolveServices(value)
    }

    for (const call of definition.calls) {
      this._callMethod(instance, call)
    }

    return instance
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   *
   * @private
   */
  _getInstanceFromFactory (definition) {
    let args = this._resolveArguments(definition.args)

    if (definition.factory.Object instanceof Reference) {
      let factoryService = this._containerBuilder.get(
        definition.factory.Object.id)

      return factoryService.constructor[definition.factory.method](...args)
    }

    return definition.factory.Object[definition.factory.method](...args)
  }

  /**
   * @param {Array} args
   * @returns {Array}
   *
   * @private
   */
  _resolveArguments (args = []) {
    let resolvedArgument = []
    args.map((argument) => {
      resolvedArgument.push(this._resolveServices(argument))
    })

    return resolvedArgument
  }

  /**
   * @param {Definition} definition
   * @param {Array} args
   * @return {Array}
   * @private
   */
  _appendParentArgumentsFromDefinition (definition, args = []) {
    const parentDefinition = this._definitions.get(definition.parent)
    if (!parentDefinition.abstract) {
      throw new NotAbstractServiceException(definition.parent)
    }

    return args.concat(this._resolveArguments(parentDefinition.appendArgs))
  }

  /**
   * @param {Reference|PackageReference|*} value
   * @returns {*}
   *
   * @private
   */
  _resolveServices (value) {
    if (value instanceof Reference) {
      if (!value.nullable ||
        (value.nullable && this._containerBuilder.hasDefinition(value.id))) {
        return this.getInstance(value.id, true)
      }
    } else if (value instanceof PackageReference) {
      return require(value.id)
    } else {
      return value
    }

    return null
  }

  /**
   * @param {*} service
   * @param {{method, args}} call
   *
   * @private
   */
  _callMethod (service, call) {
    if (typeof service[call.method] !== 'function') {
      throw new MethodCallNotFoundException(call.method)
    }

    let args = this._resolveArguments(call.args)

    service[call.method](...args)
  }
}
