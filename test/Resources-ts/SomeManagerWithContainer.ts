export default class SomeManagerWithContainer {
  constructor (private readonly _container: any) {
  }

  get container () {
    return this._container
  }
}
