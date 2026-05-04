import Bar from './Bar'

export default class PublicParamService {
    constructor(public bar: Bar) {}

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
