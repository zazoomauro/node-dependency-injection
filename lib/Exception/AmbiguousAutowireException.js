export default class AmbiguousAutowireException extends Error {
  /**
   * @param {string} interfaceName
   * @param {string} interfaceId
   * @param {string[]} serviceIds
   * @param {Array<{service: string, argument: string}>} consumers
   */
  constructor (interfaceName, interfaceId, serviceIds, consumers = []) {
    const consumerText = consumers.length > 0
      ? ` requested by ${consumers.map(({ service, argument }) => `'${service}' argument '$${argument}'`).join(', ')}`
      : ''
    super(
      `Cannot autowire '${interfaceName}' (${interfaceId})${consumerText}: ` +
      `multiple services implement it: '${serviceIds.join("', '")}'. ` +
      'Configure an explicit alias or bind to select one implementation.'
    )
    this.name = 'AmbiguousAutowireException'
    this.stack = (new Error()).stack
  }
}
