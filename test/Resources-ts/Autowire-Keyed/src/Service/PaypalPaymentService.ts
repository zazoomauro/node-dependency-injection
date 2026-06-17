import IPaymentService from '../Interface/IPaymentService'

export default class PaypalPaymentService implements IPaymentService {
    processPayment (amount: number): string {
        return `paypal:${amount}`
    }
}
