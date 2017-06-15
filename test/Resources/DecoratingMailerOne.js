export default class DecoratingMailerOne {
  constructor (inner) {
    this._inner = inner
  }

  get inner () {
    return this._inner
  }
}
