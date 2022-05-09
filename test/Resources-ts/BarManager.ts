import FooManager from "./FooManager";

export default class BarManager {
  constructor (
    private readonly _fooManager: FooManager
  ) {
  }

  get fooManager(): FooManager {
    return this._fooManager
  }
}
