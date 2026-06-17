import IPaymentService from '../Interface/IPaymentService'

export default class KeyedCheckoutService {
    constructor (
        private readonly payment: IPaymentService
    ) {}

    processPayment (amount: number): string {
        return this.payment.processPayment(amount)
    }
}
