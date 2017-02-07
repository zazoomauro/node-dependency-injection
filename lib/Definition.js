class Definition {

  /**
   * @param {*} Object
   * @param {Array} args
   */
  constructor (Object, args = []) {
    this._Object = Object
    this._args = args
    this._calls = []
    this._tags = []
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

    this._calls.push({ method: method, args: args })

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
}

export default Definition
