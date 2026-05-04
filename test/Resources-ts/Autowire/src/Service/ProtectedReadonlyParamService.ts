import Bar from './Bar'

export default class ProtectedReadonlyParamService {
    constructor(protected readonly bar: Bar) {}

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
