export default class ConfigurationFileNotFoundException extends Error {
  /**
   * @param {string} path
   */
  constructor (path) {
    super(`File ${path} not found`)
    this.name = 'ConfigurationFileNotFoundException'
    this.stack = (new Error()).stack
  }
}
