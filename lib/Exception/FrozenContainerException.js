export default class FrozenContainerException extends Error {
  constructor () {
    super('You cannot register more services when the container is frozen')
    this.name = 'FrozenContainerException'
    this.stack = (new Error()).stack
  }
}
