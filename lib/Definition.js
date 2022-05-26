import MethodCallEmptyException from './Exception/MethodCallEmptyException'
import AttributesMapException from './Exception/AttributesMapException'

class Definition {
  /**
   * @param {*|null} Object
   * @param {Array} args
   */
  constructor (Object = null, args = []) {
    this._Object = Object
    this._args = args
    this._calls = []
    this._tags = []
    this._properties = new Map()
    this._lazy = false
    this._deprecated = null
    this._factory = null
    this._public = true
    this._synthetic = false
    this._decoratedService = null
    this._decorationPriority = null
    this._shared = true
    this._abstract = false
    this._appendArgs = []
    this._parent = null
  }

  /**
   * @return {boolean}
   */
  get abstract () {
    return this._abstract
  }

  /**
   * @param {boolean} value
   */
  set abstract (value) {
    this._abstract = value
  }

  /**
   * @returns {string}
   */
  get decoratedService () {
    return this._decoratedService
  }

  /**
   * @param {string} value
   */
  set decoratedService (value) {
    this._decoratedService = value
  }

  /**
   * @return {number}
   */
  get decorationPriority () {
    return this._decorationPriority
  }

  /**
   * @param {number} value
   */
  set decorationPriority (value) {
    this._decorationPriority = value
  }

  /**
   * @returns {boolean}
   */
  get public () {
    return this._public
  }

  /**
   * @param {boolean} value
   */
  set public (value) {
    this._public = value
  }

  /**
   * @returns {null|{Object: (Object|Reference), method: string}|*}
   */
  get factory () {
    return this._factory
  }

  /**
   * @returns {null|string}
   */
  get deprecated () {
    return this._deprecated
  }

  /**
   * @param {null|string} value
   */
  set deprecated (value) {
    this._deprecated = value
  }

  /**
   * @returns {boolean}
   */
  get lazy () {
    return this._lazy
  }

  /**
   * @param {boolean} value
   */
  set lazy (value) {
    this._lazy = value
  }

  /**
   * @returns {*}
   */
  get Object () {
    return this._Object
  }

  /**
   * @param {*} value
   */
  set Object (value) {
    this._Object = value
  }

  /**
   * @returns {Array}
   */
  get args () {
    return this._args
  }

  /**
   * @param {Array} args
   */
  set args (args) {
    this._args = args
  }

  /**
   * @returns {Array}
   */
  get calls () {
    return this._calls
  }

  /**
   * @returns {Array}
   */
  get tags () {
    return this._tags
  }

  /**
   * @returns {Map}
   */
  get properties () {
    return this._properties
  }

  /**
   * @return {Array}
   */
  get appendArgs () {
    return this._appendArgs
  }

  /**
   * @param {Array} appendArgs
   */
  set appendArgs (appendArgs) {
    this._appendArgs = appendArgs
  }

  /**
   * @returns {boolean}
   */
  get synthetic () {
    return this._synthetic
  }

  /**
   * @param {boolean} value
   */
  set synthetic (value) {
    this._synthetic = value
  }

  /**
   * @returns {boolean}
   */
  get shared () {
    return this._shared
  }

  /**
   * @param {boolean} value
   */
  set shared (value) {
    this._shared = value
  }

  /**
   * @return {string}
   */
  get parent () {
    return this._parent
  }

  /**
   * @param {string} value
   */
  set parent (value) {
    this._parent = value
  }

  /**
   * @param {Object|Reference} Object
   * @param {string} method
   */
  setFactory (Object, method) {
    this._factory = {
      Object,
      method
    }
  }

  /**
   * @param {*} argument
   * @returns {Definition}
   */
  addArgument (argument, append = false) {
    const map = append ? this._appendArgs : this._args
    map.push(argument)
    return this
  }

  /**
   * @param {string} method
   * @param {Array} args
   */
  addMethodCall (method, args = []) {
    if (method.length === 0) {
      throw new MethodCallEmptyException()
    }

    this._calls.push({ method, args })

    return this
  }

  /**
   * @param {string} name
   * @param {Map} attributes
   * @returns {Definition}
   */
  addTag (name, attributes = new Map()) {
    if (attributes instanceof Map) {
      this._tags.push({ name, attributes })

      return this
    }

    throw new AttributesMapException()
  }

  /**
   * @param {string} key
   * @param {*} value
   * @returns {Definition}
   */
  addProperty (key, value) {
    this._properties.set(key, value)

    return this
  }

  /**
   * @param {boolean} bypassPublic
   * @return {boolean}
   */
  isPublic (bypassPublic = false) {
    return ((this.public) || (!bypassPublic && this.public))
  }
}

export default Definition
