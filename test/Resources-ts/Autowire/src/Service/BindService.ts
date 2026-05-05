import Bar from './Bar'

export default class BindService {
    constructor(
        private readonly adminEmail: string,
        private readonly bar: Bar,
    ) {}

    getAdminEmail(): string {
        return this.adminEmail
    }

    async callBarProcessMethod(): Promise<number> {
        return this.bar.process()
    }
}
