export default class BaseClass {
  constructor (service) {
    this._service = service
  }

  get service () {
    return this._service
  }
}
