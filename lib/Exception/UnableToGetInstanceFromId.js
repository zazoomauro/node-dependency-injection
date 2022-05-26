export default class UnableToGetInstanceFromId extends Error {
  /**
   * @param {string} id
   */
  constructor (id) {
    const typeOfId = typeof id
    super(`Unable to retrieve instance from id with type ${typeOfId}.`)
    this.name = 'UnableToGetInstanceFromId'
    this.stack = (new Error()).stack
  }
}
