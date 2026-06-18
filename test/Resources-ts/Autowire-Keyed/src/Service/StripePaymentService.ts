import IPaymentService from '../Interface/IPaymentService'

export default class StripePaymentService implements IPaymentService {
    processPayment (amount: number): string {
        return `stripe:${amount}`
    }
}
