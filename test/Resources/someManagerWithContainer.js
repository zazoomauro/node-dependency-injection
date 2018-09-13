export default class SomeManagerWithContainer {
  constructor (container) {
    this._container = container
  }

  get container () {
    return this._container
  }
}
