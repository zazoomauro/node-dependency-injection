export default class SetService {
  constructor () {
    this._bar = null
    this._foo = null
  }

  set bar (value) {
    this._bar = value
  }

  get bar () {
    return this._bar
  }

  set foo (value) {
    this._foo = value
  }

  get foo () {
    return this._foo
  }
}
