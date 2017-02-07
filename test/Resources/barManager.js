export default class BarManager {

  constructor (fooManager) {
    this._fooManager = fooManager
  }

  get fooManager () {
    return this._fooManager
  }
}
