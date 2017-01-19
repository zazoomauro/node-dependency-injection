class Definition {

  /**
   * @param {*} Object
   * @param {Array} args
   */
  constructor (Object, args = []) {
    this._Object = Object
    this._args = args
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
   * @param {*} argument
   * @returns {Definition}
   */
  addArgument (argument) {
    this._args.push(argument)

    return this
  }
}

export default Definition
