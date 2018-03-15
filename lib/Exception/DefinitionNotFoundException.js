export default class DefinitionNotFoundException extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    super(`${id} definition not found`)
    this.name = 'DefinitionNotFoundException'
    this.stack = (new Error()).stack
  }
}
