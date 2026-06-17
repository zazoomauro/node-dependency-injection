class KeyedReference {
  /**
   * @param {string} group
   * @param {string} key
   */
  constructor (group, key) {
    this._group = group
    this._key = key
  }

  /**
   * @returns {string}
   */
  get group () {
    return this._group
  }

  /**
   * @returns {string}
   */
  get key () {
    return this._key
  }
}

export default KeyedReference
