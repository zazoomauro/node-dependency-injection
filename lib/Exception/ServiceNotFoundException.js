export default class ServiceNotFoundException extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    const serviceName = (typeof id === 'function') ? id.name : id
    super(`The service ${serviceName} is not registered`)
    this.name = 'ServiceNotFoundException'
    this.stack = (new Error()).stack
  }
}
