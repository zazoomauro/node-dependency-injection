class TagReference {
  /**
   * @param {string} name
   */
  constructor (name) {
    this._name = name
  }

  /**
   * @returns {string}
   */
  get name () {
    return this._name
  }
}

export default TagReference
