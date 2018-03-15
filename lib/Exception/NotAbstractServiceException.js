export default class NotAbstractServiceException extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    super(`The parent service ${id} is not abstract`)
    this.name = 'NotAbstractServiceException'
    this.stack = (new Error()).stack
  }
}
