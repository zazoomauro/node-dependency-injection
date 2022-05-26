export default class ServiceFileNotValidExtension extends Error {
  constructor (path) {
    super(`Service file not valid extension: ${path}`)
    this.name = 'ServiceFileNotValidExtension'
    this.stack = (new Error()).stack
  }
}
