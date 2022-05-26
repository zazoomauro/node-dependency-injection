export default class ServiceFileNotAbsolute extends Error {
  constructor (path) {
    super(`Service file not absolute: ${path}`)
    this.name = 'ServiceFileNotAbsolute'
    this.stack = (new Error()).stack
  }
}
