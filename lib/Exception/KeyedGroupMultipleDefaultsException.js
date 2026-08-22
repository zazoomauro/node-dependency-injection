export default class KeyedGroupMultipleDefaultsException extends Error {
  /**
   * @param {string} group
   * @param {string[]} serviceIds
   */
  constructor (group, serviceIds) {
    super(`Multiple default keyed services found for group '${group}': '${serviceIds.join("', '")}'`)
    this.name = 'KeyedGroupMultipleDefaultsException'
    this.stack = (new Error()).stack
  }
}
