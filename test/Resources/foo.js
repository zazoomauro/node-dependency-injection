class Foo {
  constructor (bar, fs, param, parameter) {
    this._bar = bar
    this._fs = fs
    this._param = param
    this._parameter = parameter
  }

  get bar () {
    return this._bar
  }

  get fs () {
    return this._fs
  }

  get param () {
    return this._param
  }

  get parameter () {
    return this._parameter
  }

  set property (value) {
    this._property = value
  }

  get property () {
    return this._property
  }
}

export default Foo
