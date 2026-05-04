import Bar from './Bar'

export default class PrivateParamService {
    constructor(private bar: Bar) {}

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
