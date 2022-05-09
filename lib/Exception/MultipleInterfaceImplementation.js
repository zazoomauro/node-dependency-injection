export default class MultipleInterfaceImplementation extends Error {
  /**
   * @param {string} method
   */
  constructor(interfaceType) {
    super(`${interfaceType} has multiple implementations. Please choose one.`)
    this.name = 'MultipleInterfaceImplementation'
    this.stack = (new Error()).stack
  }
}
