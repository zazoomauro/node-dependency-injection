class PaypalPayment {
  charge (amount) {
    return `paypal:${amount}`
  }
}

export default PaypalPayment
