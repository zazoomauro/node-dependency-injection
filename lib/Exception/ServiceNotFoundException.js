export default class ServiceNotFoundException extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    super(`The service ${id} is not registered`)
    this.name = 'ServiceNotFoundException'
    this.stack = (new Error()).stack
  }
}
