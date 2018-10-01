export default class ServiceFileNotLoadedException extends Error {
  /**
   * @param {string} fileName
   */
  constructor (reason) {
    super(`Service file could not be loaded. ${reason}`)
    this.name = 'ServiceFileNotLoadedException'
    this.stack = (new Error()).stack
  }
}
