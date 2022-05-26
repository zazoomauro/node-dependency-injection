export default class ContainerDefaultDirMustBeSet extends Error {
  /**
   * @param {string} path
   */
  constructor () {
    super('Container default dir must be set')
    this.name = 'ContainerDefaultDirMustBeSet'
    this.stack = (new Error()).stack
  }
}
