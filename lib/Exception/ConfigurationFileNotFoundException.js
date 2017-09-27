export default class ConfigurationFileNotFoundException extends Error {
  /**
   * @param {string} path
   */
  constructor (path) {
    super(`The file ${path} not exists`)
    this.name = 'ConfigurationFileNotFoundException'
    this.stack = (new Error()).stack
  }
}
