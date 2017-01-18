class Reference {

  /**
   * @param {string|number} id
   */
  constructor(id) {
    this._id = id;
  }

  /**
   * @returns {string|number}
   */
  get id() {
    return this._id;
  }
}

export default Reference;