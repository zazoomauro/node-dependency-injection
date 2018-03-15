export default class LoadMethodNotFoundException extends Error {
  /**
   * @param {string} extension
   */
  constructor (extension) {
    super(`The extension ${extension} does not have the load method`)
    this.name = 'LoadMethodNotFoundException'
    this.stack = (new Error()).stack
  }
}
