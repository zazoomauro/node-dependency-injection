import Adapter from "./Adapter";

export default class FooBarAutowireOverride {
  constructor(private readonly _adapter: Adapter) {}

  getString(): string {
    return this._adapter.toString();
  }

  get adapter() {
    return this._adapter
  }
}
