export default class AbstractServiceException extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    super(`The service ${id} is abstract`)
    this.name = 'AbstractServiceException'
    this.stack = (new Error()).stack
  }
}
