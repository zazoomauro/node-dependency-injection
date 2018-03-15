export default class MethodCallNotFoundException extends Error {
  /**
   * @param {string} method
   */
  constructor (method) {
    super(`Method ${method} not found`)
    this.name = 'MethodCallNotFoundException'
    this.stack = (new Error()).stack
  }
}
