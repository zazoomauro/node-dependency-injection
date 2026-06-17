class ParameterReference {
  /**
   * @param {string} key
   */
  constructor (key) {
    this._key = key
  }

  /**
   * @returns {string}
   */
  get key () {
    return this._key
  }
}

export default ParameterReference
