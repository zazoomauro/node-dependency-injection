export default class WrongCompilerPassTypeException extends Error {
  /**
   * @param {string} type
   */
  constructor (type) {
    super(`${type} is a wrong compiler pass config type`)
    this.name = 'WrongCompilerPassTypeException'
    this.stack = (new Error()).stack
  }
}
