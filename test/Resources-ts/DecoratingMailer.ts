export default class DecoratingMailer {
  constructor (
    private readonly _inner: any
  ) {
  }

  get inner () {
    return this._inner
  }
}
