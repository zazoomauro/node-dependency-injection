export default class ContainerValidationError extends Error {
  /**
   * @param {import('../ValidationResult').default} result
   */
  constructor (result) {
    const lines = result.errors.map(
      (e) => `[ERROR] ${e.message}`
    )
    super(`Container validation failed with ${result.errors.length} error(s):\n${lines.join('\n')}`)
    this.name = 'ContainerValidationError'
    this.result = result
  }
}
