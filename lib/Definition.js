class Definition {

  /**
   * @param {*} className
   * @param {Array} args
   */
  constructor(className, args = []) {
    this._className = className;
    this._args = args;
  }

  /**
   * @returns {*}
   */
  get className() {
    return this._className;
  }

  /**
   * @returns {Array}
   */
  get arguments() {
    return this._args;
  }

  /**
   * @param {*} argument
   * @returns {Definition}
   */
  addArgument(argument) {
    this._args.push(argument);

    return this;
  }
}

export default Definition;