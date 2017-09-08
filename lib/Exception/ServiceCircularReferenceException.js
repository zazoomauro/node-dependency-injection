export default class ServiceCircularReferenceException extends Error {
  constructor () {
    super('Circular reference detected')
    this.name = 'ServiceCircularReferenceException'
    this.stack = (new Error()).stack
  }
}
