import Reference from './Reference'
import TagReference from './TagReference'
import PackageReference from './PackageReference'
import PrivateServiceException from './Exception/PrivateServiceException'
import ServiceNotFoundException from './Exception/ServiceNotFoundException'
import NotAbstractServiceException from './Exception/NotAbstractServiceException'
import MethodCallNotFoundException from './Exception/MethodCallNotFoundException'
import AbstractServiceException from './Exception/AbstractServiceException'
import UnableToGetInstanceFromId from './Exception/UnableToGetInstanceFromId'

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
   * @private
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {any}
   */
  _getInstanceFromStringId (id, bypassPublic) {
    id = this._alias.get(id) || id

    if (
      id === 'service_container' &&
      this._containerBuilder.containerReferenceAsService
    ) {
      return this._containerBuilder
    }

    if (this._definitions.has(id)) {
      return this._getInstanceFromId(id, bypassPublic)
    }

    this._containerBuilder.logger.warn(`The service ${id} is not registered`)
    throw new ServiceNotFoundException(id)
  }

  /**
   * @private
   * @param {Function} functionName
   * @param {boolean} bypassPublic
   * @returns {any}
   */
  _getInstanceFromFunction (functionName, bypassPublic) {
    let definitionServiceId = null
    this._definitions.forEach((definition, serviceId) => {
      if (definition.Object === functionName) {
        definitionServiceId = serviceId
      }
    })
    if (definitionServiceId) {
      return this.getInstance(definitionServiceId, bypassPublic)
    }
    this._containerBuilder.logger.warn(
      `The service ${functionName.name} is not registered`
    )
    throw new ServiceNotFoundException(functionName)
  }

  /**
   * @param {string|any} id
   * @param {boolean} bypassPublic
   * @returns {*}
   */
  getInstance (id, bypassPublic = false) {
    if (typeof id === 'string') {
      return this._getInstanceFromStringId(id, bypassPublic)
    }
    if (typeof id === 'function') {
      return this._getInstanceFromFunction(id, bypassPublic)
    }
    throw new UnableToGetInstanceFromId(id)
  }

  /**
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {*}
   * @private
   */
  _getInstanceFromId (id, bypassPublic = false) {
    const definition = this._definitions.get(id)
    this._ensureIsNotPrivate(definition, bypassPublic, id)
    this._ensureIsNotAbstract(definition, id)
    this._logDeprecations(definition)

    if (
      definition.Object ||
      definition.factory ||
      (!definition.Object && definition.synthetic)
    ) {
      return this._getExistingInstanceFromId(id, bypassPublic)
    }

    this._containerBuilder.logger.warn(`The service ${id} is not registered`)
    throw new ServiceNotFoundException(id)
  }

  /**
   * @param {Definition} definition
   * @returns {void}
   *
   * @private
   */
  _logDeprecations (definition) {
    if (definition.deprecated) {
      this._containerBuilder.logger.warn('DEPRECATED', definition.deprecated)
    }
  }

  /**
   * @param {Definition} definition
   * @param {string} id
   * @returns {void}
   *
   * @private
   */
  _ensureIsNotAbstract (definition, id) {
    if (definition.abstract) {
      throw new AbstractServiceException(id)
    }
  }

  /**
   * @param {Definition} definition
   * @param {boolean} bypassPublic
   * @param {string} id
   * @returns {void}
   *
   * @private
   */
  _ensureIsNotPrivate (definition, bypassPublic, id) {
    if (!definition.public && !bypassPublic) {
      throw new PrivateServiceException(id)
    }
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

    const instance = this.getInstanceFromDefinition(definition)
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

    try {
      args = this._appendParentArgumentsFromDefinition(definition.parent, args)
    } catch (e) {
      if (e instanceof NotAbstractServiceException) {
        throw e
      }
    }

    const instance = new definition.Object(...args)

    for (const [key, value] of definition.properties) {
      instance[key] = this._resolveServices(value)
    }

    for (const call of definition.calls) {
      this._callMethod(instance, call)
    }

    return instance
  }

  /**
   * @param {Definition} definition
   * @param {Array} args
   * @return {Array}
   * @private
   */
  _appendParentArgumentsFromDefinition (definitionParent, args = []) {
    if (definitionParent) {
      const parentDefinition = this._definitions.get(definitionParent)
      if (!parentDefinition.abstract) {
        throw new NotAbstractServiceException(definitionParent)
      }
      return args.concat(this._resolveArguments(parentDefinition.appendArgs))
    }
    return args
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   *
   * @private
   */
  _getInstanceFromFactory (definition) {
    const args = this._resolveArguments(definition.args)

    if (definition.factory.Object instanceof Reference) {
      const factoryService = this._containerBuilder.get(
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
    const resolvedArgument = []
    for (const argument of args) {
      resolvedArgument.push(this._resolveServices(argument))
    }
    return resolvedArgument
  }

  /**
   * @param {Reference|PackageReference|*} value
   * @returns {*}
   *
   * @private
   */
  _resolveServices (value) {
    if (value instanceof PackageReference) {
      return require(value.id)
    }

    if (value instanceof TagReference) {
      return this._findTaggedServices(value.name)
    }

    if (
      (value instanceof Reference && !value.nullable) ||
      (
        value instanceof Reference &&
        value.nullable &&
        this._containerBuilder.hasDefinition(value.id)
      )
    ) {
      return this.getInstance(value.id, true)
    }

    return this._getResolvedService(value)
  }

  /**
   * @param {string} value
   * @returns {null|string}
   * @private
   */
  _getResolvedService (value) {
    return (
      value instanceof Reference &&
      value.nullable &&
      !this._containerBuilder.hasDefinition(value.id)
    )
      ? null
      : value
  }

  /**
   * @param {string} tagName
   * @returns {void}
   *
   * @private
   */
  _findTaggedServices (tagName) {
    const taggedServices = []
    for (const [id, definition] of this._definitions) {
      if (definition.tags.some((tag) => { return tag.name === tagName })) {
        const serviceInstance = this.getInstance(id)
        taggedServices.push(serviceInstance)
      }
    }

    return taggedServices
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

    const args = this._resolveArguments(call.args)

    service[call.method](...args)
  }
}
