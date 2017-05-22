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
   * @param {Object|Reference} Object
   * @param {string} method
   */
  setFactory (Object, method) {
    this._factory = {
      Object: Object,
      method: method
    }
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
   * @param {Array} args
   */
  set args (args) {
    this._args = args
  }

  /**
   * @param {*} argument
   * @returns {Definition}
   */
  addArgument (argument) {
    this._args.push(argument)

    return this
  }

  /**
   * @param {string} method
   * @param {Array} args
   */
  addMethodCall (method, args = []) {
    if (method.length === 0) {
      throw new Error('Method name cannot be empty.')
    }

    this._calls.push({method: method, args: args})

    return this
  }

  /**
   * @param {string} name
   * @param {Map} attributes
   * @returns {Definition}
   */
  addTag (name, attributes = new Map()) {
    if (attributes instanceof Map) {
      this._tags.push({name: name, attributes: attributes})

      return this
    }

    throw new Error('Attributes is not type Map')
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
}

export default Definition
