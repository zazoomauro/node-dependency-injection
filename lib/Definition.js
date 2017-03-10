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
   * @returns {Definition}
   */
  addTag (name) {
    this._tags.push(name)

    return this
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
}

export default Definition
