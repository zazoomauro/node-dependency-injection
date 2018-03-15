export default class ServiceFileNotFoundException extends Error {
  /**
   * @param {string} fileName
   */
  constructor (fileName) {
    super(`Service file ${fileName} not found`)
    this.name = 'ServiceFileNotFoundException'
    this.stack = (new Error()).stack
  }
}
