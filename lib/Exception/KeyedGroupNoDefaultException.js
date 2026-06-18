export default class KeyedGroupNoDefaultException extends Error {
  /**
   * @param {string} group
   */
  constructor (group) {
    super(`No default keyed service found for group '${group}'`)
    this.name = 'KeyedGroupNoDefaultException'
    this.stack = (new Error()).stack
  }
}
