export default class ProcessMethodNotFoundException extends Error {
  /**
   * @param {string} compilerPass
   */
  constructor (compilerPass) {
    super(`The compiler pass ${compilerPass} does not have the process method`)
    this.name = 'ProcessMethodNotFoundException'
    this.stack = (new Error()).stack
  }
}
