const PHASE_ONE_TYPES = ['env_exists', 'env_equals', 'custom', 'all', 'any']
const PHASE_TWO_TYPES = ['missing', 'service_exists']

class Condition {
  /**
   * @param {string} type
   * @param {Object} options
   */
  constructor (type, options = {}) {
    this._type = type
    this._options = options
  }

  /**
   * @returns {string}
   */
  get type () {
    return this._type
  }

  /**
   * @returns {Object}
   */
  get options () {
    return this._options
  }

  /**
   * @returns {boolean}
   */
  isPhaseOne () {
    return PHASE_ONE_TYPES.includes(this._type)
  }

  /**
   * @returns {boolean}
   */
  isPhaseTwo () {
    return PHASE_TWO_TYPES.includes(this._type)
  }

  /**
   * Evaluate this condition against the current environment.
   * For phase-one conditions only.
   *
   * @returns {boolean}
   */
  evaluate () {
    switch (this._type) {
      case 'env_exists':
        return process.env[this._options.var] !== undefined

      case 'env_equals':
        return process.env[this._options.var] === this._options.value

      case 'custom':
        return Boolean(this._options.fn())

      case 'all':
        return this._options.conditions.every(c => c.evaluate())

      case 'any':
        return this._options.conditions.some(c => c.evaluate())

      default:
        return true
    }
  }

  /**
   * Evaluate a phase-two condition against the current set of definition ids.
   *
   * @param {Set<string>} remainingIds
   * @returns {boolean}
   */
  evaluatePhaseTwo (remainingIds) {
    switch (this._type) {
      case 'missing':
        return !remainingIds.has(this._options.id)

      case 'service_exists':
        return remainingIds.has(this._options.id)

      default:
        return true
    }
  }

  /**
   * Register only if the environment variable exists.
   *
   * @param {string} varName
   * @returns {Condition}
   */
  static envExists (varName) {
    return new Condition('env_exists', { var: varName })
  }

  /**
   * Register only if the environment variable equals a specific value.
   *
   * @param {string} varName
   * @param {string} value
   * @returns {Condition}
   */
  static envEquals (varName, value) {
    return new Condition('env_equals', { var: varName, value })
  }

  /**
   * Register only if the custom function returns truthy.
   * Evaluated at compile time.
   *
   * @param {Function} fn
   * @returns {Condition}
   */
  static custom (fn) {
    return new Condition('custom', { fn })
  }

  /**
   * Register only if all given conditions pass.
   *
   * @param {...Condition} conditions
   * @returns {Condition}
   */
  static all (...conditions) {
    return new Condition('all', { conditions })
  }

  /**
   * Register only if any of the given conditions passes.
   *
   * @param {...Condition} conditions
   * @returns {Condition}
   */
  static any (...conditions) {
    return new Condition('any', { conditions })
  }

  /**
   * Register only if no service with the given id is registered (TryAdd pattern).
   * Evaluated in phase two (after phase-one conditions are resolved).
   *
   * @param {string} id
   * @returns {Condition}
   */
  static missing (id) {
    return new Condition('missing', { id })
  }

  /**
   * Register only if a service with the given id is registered.
   * Evaluated in phase two (after phase-one conditions are resolved).
   *
   * @param {string} id
   * @returns {Condition}
   */
  static serviceExists (id) {
    return new Condition('service_exists', { id })
  }
}

export default Condition
