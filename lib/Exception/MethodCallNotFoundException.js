export default class MethodCallNotFoundException extends Error {
  /**
   * @param {string} method
   */
  constructor (method) {
    super(`The method ${method} does not exists`)
    this.name = 'MethodCallNotFoundException'
    this.stack = (new Error()).stack
  }
}
