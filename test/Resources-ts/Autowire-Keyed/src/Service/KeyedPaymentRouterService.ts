import IPaymentService from '../Interface/IPaymentService'

export default class KeyedPaymentRouterService {
    constructor (
        private readonly payments: Map<string, IPaymentService>
    ) {}

    route (key: string, amount: number): string {
        const payment = this.payments.get(key)
        if (!payment) {
            throw new Error(`No payment service for key: ${key}`)
        }
        return payment.processPayment(amount)
    }
}
