import Service from "./Service";

export default class BaseClass {
  constructor (
    private readonly _service: Service
  ) {
  }

  get service () {
    return this._service
  }
}
