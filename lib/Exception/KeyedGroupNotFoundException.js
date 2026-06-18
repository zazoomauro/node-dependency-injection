export default class KeyedGroupNotFoundException extends Error {
  /**
   * @param {string} group
   */
  constructor (group) {
    super(`Keyed group '${group}' is not registered`)
    this.name = 'KeyedGroupNotFoundException'
    this.stack = (new Error()).stack
  }
}
