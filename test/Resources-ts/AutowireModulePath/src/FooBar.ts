import Foo from '@app/Service/Foo'
import IBar from '@app/Interface/IBar'
import IMultiple from '@app/Interface/IMultiple'

export default class FooBar {
    constructor(
        private readonly _foo: Foo,
        private readonly _bar: IBar,
        private readonly _multiple: IMultiple,
    ) {}

    get foo(): Foo {
        return this._foo
    }

    async callBarProcessMethod(): Promise<number> {
        return this._bar.process()
    }

    get multiple() {
        return this._multiple
    }
}
