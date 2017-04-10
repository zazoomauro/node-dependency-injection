export default class PassConfig {
  /**
   * @returns {string}
   */
  static get TYPE_BEFORE_OPTIMIZATION () {
    return 'beforeOptimization'
  }

  /**
   * @returns {string}
   */
  static get TYPE_OPTIMIZE () {
    return 'optimize'
  }

  /**
   * @returns {string}
   */
  static get TYPE_BEFORE_REMOVING () {
    return 'beforeRemoving'
  }

  /**
   * @returns {string}
   */
  static get TYPE_REMOVE () {
    return 'remove'
  }

  /**
   * @returns {string}
   */
  static get TYPE_AFTER_REMOVING () {
    return 'afterRemoving'
  }

  /**
   * @param {string} type
   * @returns {boolean}
   */
  static isValidType (type) {
    return (
      this.TYPE_BEFORE_OPTIMIZATION === type ||
      this.TYPE_OPTIMIZE === type ||
      this.TYPE_BEFORE_REMOVING === type ||
      this.TYPE_REMOVE === type ||
      this.TYPE_AFTER_REMOVING === type
    )
  }
}
