export default class KeyedServiceNotFoundException extends Error {
  /**
   * @param {string} group
   * @param {string} key
   */
  constructor (group, key) {
    super(`Keyed service '${key}' in group '${group}' is not registered`)
    this.name = 'KeyedServiceNotFoundException'
    this.stack = (new Error()).stack
  }
}
