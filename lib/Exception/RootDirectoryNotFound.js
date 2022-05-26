export default class RootDirectoryNotFound extends Error {
  constructor () {
    super('Root directory not found')
    this.name = 'RootDirectoryNotFound'
    this.stack = (new Error()).stack
  }
}
