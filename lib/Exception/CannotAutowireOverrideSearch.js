export default class CannotAutowireOverrideSearch extends Error {
  constructor (className = null) {
    super(`Cannot Autowire Override ${className}`)
    this.name = 'CannotAutowireOverrideSearch'
    this.stack = (new Error()).stack
  }
}
