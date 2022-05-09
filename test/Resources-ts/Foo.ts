import Bar from "./Bar"

class Foo {
  constructor (
    private readonly _bar: Bar, 
    private readonly _fs: any,
    private readonly _param: any, 
    private readonly _parameter: any,
    private readonly _env: any,
  ) {
  }

  get bar (): Bar {
    return this._bar
  }

  get fs (): any {
    return this._fs
  }

  get param (): any {
    return this._param
  }

  get parameter (): any {
    return this._parameter
  }

  get env (): any {
    return this._env
  }
}

export default Foo
