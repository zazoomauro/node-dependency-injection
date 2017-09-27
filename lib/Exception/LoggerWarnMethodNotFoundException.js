export default class LoggerWarnMethodNotFoundException extends Error {
  constructor () {
    super('The logger instance does not implements the warn method')
    this.name = 'LoggerWarnMethodNotFoundException'
    this.stack = (new Error()).stack
  }
}
