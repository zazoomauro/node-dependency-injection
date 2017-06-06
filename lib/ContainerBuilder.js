import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'
import PassConfig from './PassConfig'
import OptimizePass from './CompilerPass/OptimizePass'
import DecoratePass from './CompilerPass/DecoratePass'
import RemovePass from './CompilerPass/RemovePass'

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
      beforeRemoving: [],
      remove: [],
      afterRemoving: []
    }
    this._extensions = []
    this._logger = console
  }

  /**
   * @returns {Map}
   */
  get definitions () {
    return this._definitions
  }

  /**
   * @returns {boolean}
   */
  get frozen () {
    return this._frozen
  }

  /**
   * @param {boolean} value
   */
  set frozen (value) {
    this._frozen = value
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
  _getExistingInstanceFromId (id, bypassPublic = false) {
    const definition = this._definitions.get(id)

    if (definition.shared) {
      return this.getInstanceFromDefinition(definition)
    }

    if (this._container.has(id) &&
      ((definition.public) || (!bypassPublic && definition.public))) {
      return this._container.get(id)
    }

    let instance = this.getInstanceFromDefinition(definition)
    this._container.set(id, instance)

    return instance
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
      throw new Error(`The service ${id} is private`)
    }

    if (definition.deprecated) {
      this.logger.warn('DEPRECATED', definition.deprecated)
    }

    if ((definition.Object) || definition.factory ||
      (!definition.Object && definition.synthetic)) {
      return this._getExistingInstanceFromId(id, bypassPublic)
    }

    throw new Error(`The service ${id} is not registered`)
  }

  /**
   * @param {string} id
   * @param {boolean} bypassPublic
   * @returns {*}
   *
   * @private
   */
  _getInstance (id, bypassPublic = false) {
    id = this._alias.get(id) || id

    if (this._definitions.has(id)) {
      return this._getInstanceFromId(id, bypassPublic)
    }

    throw new Error(`The service ${id} is not registered`)
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
   *
   * @private
   */
  _processCompilerPass (type) {
    this._compilerPass[type] = this._compilerPass[type].filter((i) => {
      return i !== null
    })

    for (let compilerPass of this._compilerPass[type]) {
      compilerPass.process(this)
    }
  }

  /**
   * @private
   */
  _loadExtensions () {
    for (let extension of this.extensions) {
      extension.load(this)
    }
  }

  compile () {
    if (!this.frozen) {
      this._loadExtensions()
      this._optimize()
      this._remove()
    }
  }

  /**
   * @param {string} type
   * @param {*} compilerPass
   * @private
   */
  _checkAndAddCompilerPass (type, compilerPass) {
    if (this._compilerPass[type].length === 0) {
      this.addCompilerPass(compilerPass, type)
    }
  }

  /**
   * @private
   */
  _optimize () {
    this.addCompilerPass(new DecoratePass(),
      PassConfig.TYPE_BEFORE_OPTIMIZATION)
    this._processCompilerPass(PassConfig.TYPE_BEFORE_OPTIMIZATION)
    this._checkAndAddCompilerPass(PassConfig.TYPE_OPTIMIZE, new OptimizePass())
    this._processCompilerPass(PassConfig.TYPE_OPTIMIZE)
  }

  /**
   * @private
   */
  _remove () {
    this._processCompilerPass(PassConfig.TYPE_BEFORE_REMOVING)
    this._checkAndAddCompilerPass(PassConfig.TYPE_REMOVE, new RemovePass())
    this._processCompilerPass(PassConfig.TYPE_REMOVE)
    this._processCompilerPass(PassConfig.TYPE_AFTER_REMOVING)
  }

  /**
   * @param {string} type
   * @param {number} priority
   * @returns {number}
   *
   * @private
   */
  _getCompilerPassPriorityNumber (type, priority) {
    if (this._compilerPass[type][priority]) {
      return this._getCompilerPassPriorityNumber(type, priority + 1)
    }

    return priority
  }

  /**
   * @param {*} compilerPass
   * @param {string} type
   * @param {number} priority
   */
  addCompilerPass (
    compilerPass, type = PassConfig.TYPE_BEFORE_OPTIMIZATION, priority = 0) {
    if (typeof compilerPass.process !== 'function') {
      throw new Error('Your compiler pass does not have the process method')
    }

    if (!PassConfig.isValidType(type)) {
      throw new Error(`${type} is a wrong compiler pass config type`)
    }

    const arrayLevel = this._getCompilerPassPriorityNumber(type, priority)
    this._compilerPass[type][arrayLevel] = compilerPass
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
      if (definition.tags.some((tag) => { return tag.name === name })) {
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
      typeof value !== 'boolean' && typeof value !== 'object') {
      throw new TypeError(
        'The expected value is not a flat string, an array, a boolean or an object')
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
   * @param {string} method
   * @param {string} key
   * @returns {Definition|boolean}
   * @private
   */
  _definition (method, key) {
    if (this._definitions.has(key)) {
      return this._definitions[method](key)
    }

    throw new Error(`${key} definition not found`)
  }

  /**
   * @param {string} key
   * @returns {Definition}
   */
  getDefinition (key) {
    return this._definition('get', key)
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  removeDefinition (key) {
    return this._definition('delete', key)
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

  /**
   * @param {string} id
   * @param {*} instance
   */
  set (id, instance) {
    this._container.set(id, instance)
  }

  /**
   * @param {string} id
   */
  remove (id) {
    this._container.delete(id)
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  isSet (id) {
    return this._container.has(id)
  }

  /**
   * @returns {Console|*}
   */
  get logger () {
    return this._logger
  }

  /**
   * @param {Console|*} value
   */
  set logger (value) {
    if (typeof value.warn !== 'function') {
      throw new Error('The logger instance does not implements the warn method')
    }
    this._logger = value
  }
}

export default ContainerBuilder
