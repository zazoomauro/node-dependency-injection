import Bar from './Bar'

export default class PublicReadonlyParamService {
    constructor(public readonly bar: Bar) {}

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
