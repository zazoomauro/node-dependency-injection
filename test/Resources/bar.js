class Bar {
  setFooBar (foobar) {
    this._fooBar = foobar
  }

  get barMethod () {
    return this._fooBar
  }
}

export default Bar
