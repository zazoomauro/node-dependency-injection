class Reference {
  /**
   * @param {string} id
   * @param {boolean} nullable
   */
  constructor (id, nullable = false) {
    this._id = id
    this._nullable = nullable
  }

  /**
   * @returns {string}
   */
  get id () {
    return this._id
  }

  /**
   * @returns {boolean}
   */
  get nullable () {
    return this._nullable
  }
}

export default Reference
