export default class MethodCallEmptyException extends Error {
  constructor () {
    super('Method name cannot be empty')
    this.name = 'MethodCallEmptyException'
    this.stack = (new Error()).stack
  }
}
