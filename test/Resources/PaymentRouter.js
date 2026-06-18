class PaymentRouter {
  constructor (payments) {
    this._payments = payments
  }

  get payments () {
    return this._payments
  }
}

export default PaymentRouter
