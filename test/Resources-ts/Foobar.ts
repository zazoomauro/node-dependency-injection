class FooBar {
  constructor (
    private readonly _param: any,
  ) {
  }

  get param () {
    return this._param
  }
}

export default FooBar
