export default class MissingDependencies {

  constructor (required, optional = null) {
    this.required = required
    this.optional = optional
  }

  setMethod (optional = null) {
    this.optional = optional
  }
}
