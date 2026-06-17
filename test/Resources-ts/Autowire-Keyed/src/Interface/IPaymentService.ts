export default interface IPaymentService {
    processPayment(amount: number): string
}
