class Definition {

  /**
   * @param {*} Object
   * @param {Array} args
   */
  constructor (Object, args = []) {
    this._Object = Object
    this._args = args
    this._calls = []
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
  get arguments () {
    return this._args
  }

  /**
   * @returns {Array}
   */
  get calls () {
    return this._calls
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
   * @param {Array} args
   * @returns {Definition}
   */
  setArguments (args) {
    this._args = args

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
}

export default Definition
