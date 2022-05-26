import FooBar from "./Foobar"

export default class Bar {
  private _fooBar?: FooBar = undefined;

  setFooBar (foobar: FooBar) {
    this._fooBar = foobar
  }

  get barMethod () {
    return this._fooBar
  }
}
