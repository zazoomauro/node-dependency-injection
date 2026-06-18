class KeyedGroupReference {
  /**
   * @param {string} group
   */
  constructor (group) {
    this._group = group
  }

  /**
   * @returns {string}
   */
  get group () {
    return this._group
  }
}

export default KeyedGroupReference
