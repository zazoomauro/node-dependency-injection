class StripePayment {
  charge (amount) {
    return `stripe:${amount}`
  }
}

export default StripePayment
