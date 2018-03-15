export default class WrongDefinitionException extends Error {
  constructor () {
    super('You cannot register not valid definition')
    this.name = 'WrongDefinitionException'
    this.stack = (new Error()).stack
  }
}
