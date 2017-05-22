export default class DecoratingMailer {
  constructor (inner) {
    this._inner = inner
  }

  get inner () {
    return this._inner
  }
}
