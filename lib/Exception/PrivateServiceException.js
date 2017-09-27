export default class PrivateServiceException extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    super(`The service ${id} is private`)
    this.name = 'PrivateServiceException'
    this.stack = (new Error()).stack
  }
}
