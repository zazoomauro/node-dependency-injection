import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'

class ContainerBuilder {

  constructor () {
    this._definitions = new Map()
    this._parameters = new Map()
    this._alias = new Map()
    this._container = new Map()
    this._frozen = false
    this._compilerPass = []
  }

  /**
   * @returns {boolean}
   */
  get frozen () {
    return this._frozen
  }

  /**
   * @param {string|number} id
   * @param {*} object
   * @param {Array} args
   * @returns {Definition}
   */
  register (id, object, args = []) {
    if (!this.frozen) {
      let definition = new Definition(object, args)

      return this.setDefinition(id, definition)
    }

    throw new Error('You cannot register more services when the container is frozen')
  }

  /**
   * @param {string} id
   */
  get (id) {
    id = this._alias.get(id) || id

    if (this._container.get(id)) {
      return this._container.get(id)
    }

    let definition = this._definitions.get(id)

    if (definition) {
      if (definition.deprecated) {
        console.warn('DEPRECATED', definition.deprecated)
      }

      let instance = this._getInstanceFromDefinition(definition)
      this._container.set(id, instance)

      return instance
    }

    throw new Error(`The service ${id} is not registered`)
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   *
   * @private
   */
  _getInstanceFromDefinition (definition) {
    if (definition.factory) {
      return this._getInstanceFromFactory(definition)
    }

    let args = this._resolveArguments(definition.args)
    let instance = new definition.Object(...args)

    for (let [key, value] of definition.properties) {
      instance[key] = this._resolveServices(value)
    }

    for (let call of definition.calls) {
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
    if (definition.factory.Object instanceof Reference) {
      let factoryService = this.get(definition.factory.Object.id)

      return factoryService.constructor[definition.factory.method](...definition.args)
    }

    return definition.factory.Object[definition.factory.method](...definition.args)
  }

  /**
   * @param {*} service
   * @param {{method, args}} call
   *
   * @private
   */
  _callMethod (service, call) {
    if (typeof service[call.method] !== 'function') {
      return
    }

    let args = this._resolveArguments(call.args)

    service[call.method](...args)
  }

  /**
   * @param {Array} args
   * @returns {Array}
   *
   * @private
   */
  _resolveArguments (args = []) {
    let resolvedArgument = []

    for (let argument of args) {
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
    if (value instanceof Reference) {
      return this.get(value.id)
    } else if (value instanceof PackageReference) {
      return require(value.id)
    } else {
      return value
    }
  }

  compile () {
    if (!this._frozen) {
      for (let compilerPass of this._compilerPass) {
        compilerPass.process(this)
      }

      for (let [id, definition] of this._definitions) {
        if (!this._container.get(id)) {
          if (!definition.lazy) {
            let instance = this._getInstanceFromDefinition(definition)
            this._container.set(id, instance)
          }
        }
      }

      this._frozen = true
    }
  }

  /**
   * @param {*} compilerPass
   */
  addCompilerPass (compilerPass) {
    if (typeof compilerPass.process !== 'function') {
      throw new Error('Your compiler pass does not have the process method')
    }

    this._compilerPass.push(compilerPass)
  }

  /**
   * @param {string} alias
   * @param {string} id
   */
  setAlias (alias, id) {
    this._alias.set(alias, id)
  }

  /**
   * @param {string} id
   * @param {Definition} definition
   * @returns {Definition}
   */
  setDefinition (id, definition) {
    if (definition instanceof Definition) {
      this._definitions.set(id, definition)

      return definition
    }

    throw new Error('You cannot register not valid definition')
  }

  /**
   * @param {string} name
   * @returns {Map}
   */
  findTaggedServiceIds (name) {
    let taggedServices = new Map()
    for (let [id, definition] of this._definitions) {
      if (definition.tags.indexOf(name) > -1) {
        taggedServices.set(id, definition)
      }
    }

    return taggedServices
  }

  /**
   * @param {string} key
   * @param {string|Array} value
   */
  setParameter (key, value) {
    if (typeof value !== 'string' && !Array.isArray(value)) {
      throw new TypeError('The expected value is not a flat string or an array')
    }

    this._parameters.set(key, value)
  }

  /**
   * @param {string} key
   * @returns {string|Array}
   */
  getParameter (key) {
    return this._parameters.get(key)
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  hasParameter (key) {
    return this._parameters.has(key)
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  hasDefinition (key) {
    return this._definitions.has(key)
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  has (key) {
    return this._definitions.has(key) || this._parameters.has(key) || this._alias.has(key)
  }

  /**
   * @param {string} key
   * @returns {Definition}
   */
  getDefinition (key) {
    if (this._definitions.has(key)) {
      return this._definitions.get(key)
    }

    throw new Error(`${key} definition not found`)
  }

  /**
   * @param {string} key
   * @returns {Promise}
   */
  findDefinition (key) {
    key = this._alias.get(key) || key

    if (this._definitions.has(key)) {
      return this._definitions.get(key)
    }

    throw new Error(`${key} definition not found`)
  }
}

export default ContainerBuilder
