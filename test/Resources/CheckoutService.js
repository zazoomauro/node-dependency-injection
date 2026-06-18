class CheckoutService {
  constructor (payment) {
    this._payment = payment
  }

  get payment () {
    return this._payment
  }
}

export default CheckoutService
