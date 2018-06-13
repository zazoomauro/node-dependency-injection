export default class SetterParamNotFoundException extends Error {
  constructor () {
    super(`Setter param not found`)
    this.name = 'SetterParamNotFoundException'
    this.stack = (new Error()).stack
  }
}
