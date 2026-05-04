import Bar from './Bar'

export default class ProtectedParamService {
    constructor(protected bar: Bar) {}

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
