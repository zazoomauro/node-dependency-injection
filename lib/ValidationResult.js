export const SEVERITY_ERROR = 'ERROR'
export const SEVERITY_WARN = 'WARN'
export const SEVERITY_INFO = 'INFO'

export default class ValidationResult {
  constructor () {
    this._errors = []
    this._warnings = []
    this._info = []
  }

  /**
   * @param {string} type
   * @param {string} service
   * @param {string} detail
   * @param {string} message
   */
  addError (type, service, detail, message) {
    this._errors.push({ severity: SEVERITY_ERROR, type, service, detail, message })
  }

  /**
   * @param {string} type
   * @param {string} service
   * @param {string} detail
   * @param {string} message
   */
  addWarning (type, service, detail, message) {
    this._warnings.push({ severity: SEVERITY_WARN, type, service, detail, message })
  }

  /**
   * @param {string} type
   * @param {string} service
   * @param {string} detail
   * @param {string} message
   */
  addInfo (type, service, detail, message) {
    this._info.push({ severity: SEVERITY_INFO, type, service, detail, message })
  }

  /**
   * @returns {Array<{severity: string, type: string, service: string, detail: string, message: string}>}
   */
  get errors () {
    return this._errors
  }

  /**
   * @returns {Array<{severity: string, type: string, service: string, detail: string, message: string}>}
   */
  get warnings () {
    return this._warnings
  }

  /**
   * @returns {Array<{severity: string, type: string, service: string, detail: string, message: string}>}
   */
  get info () {
    return this._info
  }

  /**
   * @returns {boolean}
   */
  get isValid () {
    return this._errors.length === 0
  }

  /**
   * @returns {number}
   */
  get serviceCount () {
    return this._serviceCount || 0
  }

  /**
   * @param {number} count
   */
  set serviceCount (count) {
    this._serviceCount = count
  }
}
