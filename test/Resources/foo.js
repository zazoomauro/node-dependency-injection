class Foo {
    constructor(bar, fs, param) {
        this._bar = bar;
        this._fs = fs;
        this._param = param;
    }

    get bar() {
        return this._bar;
    }

    get fs() {
        return this._fs;
    }

    get param() {
        return this._param;
    }
}

export default Foo;