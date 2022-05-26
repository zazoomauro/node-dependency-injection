export default class RootDirectoryMustBeAbsolute extends Error {
  constructor () {
    super('Root directory must be absolute')
    this.name = 'RootDirectoryMustBeAbsolute'
    this.stack = (new Error()).stack
  }
}
