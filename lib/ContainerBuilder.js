import Definition from './Definition'
import Map from 'collections/map'
import PassConfig from './PassConfig'
import Compiler from './Compiler'
import CompilerPass from './CompilerPass'
import InstanceManager from './InstanceManager'
import DefinitionNotFoundException from './Exception/DefinitionNotFoundException'
import LoadMethodNotFoundException from './Exception/LoadMethodNotFoundException'
import LoggerWarnMethodNotFoundException from './Exception/LoggerWarnMethodNotFoundException'
import WrongDefinitionException from './Exception/WrongDefinitionException'
import FrozenContainerException from './Exception/FrozenContainerException'

class ContainerBuilder {
  constructor (containerReferenceAsService = false) {
    this._definitions = new Map()
    this._parameters = new Map()
    this._alias = new Map()
    this._container = new Map()
    this._frozen = false
    this._compilerPass = new CompilerPass(this)
    this._extensions = []
    this._logger = console
    this._instanceManager = undefined
    this._containerReferenceAsService = containerReferenceAsService
  }

  canContainerBeService () {
    return this._containerReferenceAsService
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

    throw new FrozenContainerException()
  }

  /**
   * @return {InstanceManager}
   */
  get instanceManager () {
    if (!this._instanceManager) {
      this._instanceManager = new InstanceManager(this, this._definitions,
        this._alias)
    }
    return this._instanceManager
  }

  /**
   * @param {string} id
   */
  get (id) {
    return this.instanceManager.getInstance(id)
  }

  compile () {
    new Compiler(this).run()
  }

  /**
   * @param {*} compilerPass
   * @param {string} type
   * @param {number} priority
   */
  addCompilerPass (
    compilerPass, type = PassConfig.TYPE_BEFORE_OPTIMIZATION, priority = 0) {
    this._compilerPass.register(compilerPass, type, priority)
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

    throw new WrongDefinitionException()
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

    throw new DefinitionNotFoundException(key)
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

    throw new DefinitionNotFoundException(key)
  }

  /**
   * @param {*} extension
   */
  registerExtension (extension) {
    if (typeof extension.load !== 'function') {
      throw new LoadMethodNotFoundException(extension.constructor.name)
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
      throw new LoggerWarnMethodNotFoundException()
    }
    this._logger = value
  }

  /**
   * @return {Map}
   */
  get services () {
    return this._container
  }
}

export default ContainerBuilder
