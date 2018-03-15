export default class AttributesMapException extends Error {
  constructor () {
    super('Attributes is not type Map')
    this.name = 'AttributesMapException'
    this.stack = (new Error()).stack
  }
}
