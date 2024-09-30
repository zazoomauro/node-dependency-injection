import Adapter from "./Adapter";
import AnotherService from "./AnotherService";
import SomeService from "./SomeService";

export default class AnotherFooBarAutowireOverride {
  constructor(
    private readonly _adapter: Adapter,
    private readonly _someService: SomeService,
    private readonly _anotherService: AnotherService
  ) {
  }

  getString(): string {
    return this._adapter.toString();
  }

  get adapter() {
    return this._adapter
  }
}
