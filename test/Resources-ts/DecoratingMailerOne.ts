export default class DecoratingMailerOne {
  constructor (private readonly _inner: any) {
  }

  get inner () {
    return this._inner
  }
}
