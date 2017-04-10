class PackageReference {
  /**
   * @param {string} id
   */
  constructor (id) {
    this._id = id
  }

  /**
   * @returns {string}
   */
  get id () {
    return this._id
  }
}

export default PackageReference
