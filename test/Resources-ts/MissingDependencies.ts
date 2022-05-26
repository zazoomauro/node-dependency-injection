export default class MissingDependencies {
  constructor (
    private readonly required: boolean, 
    private optional = null
  ) {
  }

  setMethod (optional = null): void {
    this.optional = optional
  }
}
