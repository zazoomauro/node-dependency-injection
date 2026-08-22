class TaggedReference {
  /**
   * @param {string} tag
   * @param {string|null} indexAttribute
   */
  constructor (tag, indexAttribute = null) {
    this._tag = tag
    this._indexAttribute = indexAttribute
  }

  /**
   * @returns {string}
   */
  get tag () {
    return this._tag
  }

  /**
   * @returns {string|null}
   */
  get indexAttribute () {
    return this._indexAttribute
  }
}

export default TaggedReference
