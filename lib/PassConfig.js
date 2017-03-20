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
   * @param {string} type
   * @returns {boolean}
   */
  static isValidType (type) {
    return (
      this.TYPE_BEFORE_OPTIMIZATION === type ||
      this.TYPE_OPTIMIZE === type
    )
  }
}
