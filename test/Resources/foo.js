class Foo {
  constructor (bar, fs, param, parameter, env) {
    this._bar = bar
    this._fs = fs
    this._param = param
    this._parameter = parameter
    this._env = env
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

  get env () {
    return this._env
  }

  set property (value) {
    this._property = value
  }

  get property () {
    return this._property
  }
}

export default Foo
