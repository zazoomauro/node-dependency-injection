import Bar from './Bar'

export default class PlainParamService {
    bar: Bar

    constructor(bar: Bar) {
        this.bar = bar
    }

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
