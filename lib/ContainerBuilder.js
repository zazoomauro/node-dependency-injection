import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'
import PassConfig from './PassConfig'

class ContainerBuilder {
  constructor () {
    this._definitions = new Map()
    this._parameters = new Map()
    this._alias = new Map()
    this._container = new Map()
    this._frozen = false
    this._compilerPass = {
      beforeOptimization: [],
      optimize: [],
    }
    this._extensions = []
  }

  /**
   * @returns {boolean}
   */
  get frozen () {
    return this._frozen
  }

  /**
   * @param {string|number} id
   * @param {*|null} object
   * @param {Array} args
   * @returns {Definition}
   */
  register (id, object = null, args = []) {
    if (!this.frozen) {
      let definition = new Definition()
      definition.Object = object
      definition.args = args

      if (!object) {
        definition.synthetic = true
      }

      return this.setDefinition(id, definition)
    }

    throw new Error(
      'You cannot register more services when the container is frozen')
  }

  /**
   * @param {string} id
   */
  get (id) {
    return this._getInstance(id)
  }

  /**
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {*}
   * @private
   */
  _getInstance (id, bypassPublic = false) {
    id = this._alias.get(id) || id

    if (this._definitions.has(id)) {
      let definition = this._definitions.get(id)

      if ((definition.Object) || definition.factory ||
        (!definition.Object && definition.synthetic)) {
        if (this._container.has(id) &&
          ((definition.public) || (!bypassPublic && definition.public))) {
          return this._container.get(id)
        }

        if (definition.deprecated) {
          console.warn('DEPRECATED', definition.deprecated)
        }

        if (!definition.public && !bypassPublic) {
          throw new Error(`The service ${id} is private`)
        }

        let instance = this._getInstanceFromDefinition(definition)
        this._container.set(id, instance)

        return instance
      }
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
    let args = this._resolveArguments(definition.args)

    if (definition.factory.Object instanceof Reference) {
      let factoryService = this.get(definition.factory.Object.id)

      return factoryService.constructor[definition.factory.method](...args)
    }

    return definition.factory.Object[definition.factory.method](...args)
  }

  /**
   * @param {*} service
   * @param {{method, args}} call
   *
   * @private
   */
  _callMethod (service, call) {
    if (typeof service[call.method] !== 'function') {
      throw new Error(`The method ${call.method} does not exists`)
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
      if (!value.nullable || (value.nullable && this.hasDefinition(value.id))) {
        return this._getInstance(value.id, true)
      }
    } else if (value instanceof PackageReference) {
      return require(value.id)
    } else {
      return value
    }

    return null
  }

  /**
   * @param {string} type
   * @private
   */
  _processCompilerPass (type) {
    for (let compilerPass of this._compilerPass[type]) {
      compilerPass.process(this)
    }
  }

  _loadExtensions () {
    for (let extension of this.extensions) {
      extension.load(this)
    }
  }

  compile () {
    if (!this._frozen) {
      this._loadExtensions()
      this._processCompilerPass(PassConfig.TYPE_BEFORE_OPTIMIZATION)

      if (this._compilerPass[PassConfig.TYPE_OPTIMIZE].length > 0) {
        this._processCompilerPass(PassConfig.TYPE_OPTIMIZE)
      } else {
        this._optimize()
        this._frozen = true
      }
    }
  }

  _optimize () {
    for (let [id, definition] of this._definitions) {
      if (!this._container.get(id) && !definition.lazy) {
        let instance = this._getInstanceFromDefinition(definition)
        this._container.set(id, instance)
      }
    }
  }

  /**
   * @param {*} compilerPass
   * @param {string} type
   */
  addCompilerPass (compilerPass, type = PassConfig.TYPE_BEFORE_OPTIMIZATION) {
    if (typeof compilerPass.process !== 'function') {
      throw new Error('Your compiler pass does not have the process method')
    }

    if (!PassConfig.isValidType(type)) {
      throw new Error(`${type} is a wrong compiler pass config type`)
    }

    this._compilerPass[type].push(compilerPass)
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
    if (typeof value !== 'string' && !Array.isArray(value) &&
      typeof value !== 'boolean') {
      throw new TypeError(
        'The expected value is not a flat string, an array or boolean')
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
    return this._definitions.has(key) || this._parameters.has(key) ||
      this._alias.has(key)
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

  /**
   * @param {string} key
   * @returns {boolean}
   */
  removeDefinition (key) {
    if (this._definitions.has(key)) {
      return this._definitions.delete(key)
    }

    throw new Error(`${key} definition not found`)
  }

  /**
   * @param {*} extension
   */
  registerExtension (extension) {
    if (typeof extension.load !== 'function') {
      throw new Error('Your extension does not have the load method')
    }

    this._extensions.push(extension)
  }

  /**
   * @returns {Array}
   */
  get extensions () {
    return this._extensions
  }

  set (id, instance) {
    this._container.set(id, instance)
  }
}

export default ContainerBuilder
