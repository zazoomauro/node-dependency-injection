const LEVEL_SILENT = 0
const LEVEL_WARN = 1
const LEVEL_INFO = 2
const LEVEL_DEBUG = 3

const LEVEL_MAP = {
  silent: LEVEL_SILENT,
  warn: LEVEL_WARN,
  info: LEVEL_INFO,
  debug: LEVEL_DEBUG
}

export default class LoggerHelper {
  /**
   * @param {object} logger
   * @param {string} verbosity - 'silent' | 'warn' | 'info' | 'debug'
   */
  constructor (logger, verbosity = 'warn') {
    this._logger = logger
    this._level = LoggerHelper.parseLevel(verbosity)
  }

  /**
   * @param {string} verbosity
   * @returns {number}
   */
  static parseLevel (verbosity) {
    const level = LEVEL_MAP[verbosity]
    if (level === undefined) {
      throw new TypeError(
        `Invalid verbosity level "${verbosity}". Expected one of: silent, warn, info, debug`
      )
    }
    return level
  }

  static get LEVEL_SILENT () { return LEVEL_SILENT }
  static get LEVEL_WARN () { return LEVEL_WARN }
  static get LEVEL_INFO () { return LEVEL_INFO }
  static get LEVEL_DEBUG () { return LEVEL_DEBUG }

  /**
   * @param {any} message
   * @param {any[]} optionalParams
   */
  warn (message, ...optionalParams) {
    if (this._level >= LEVEL_WARN && typeof this._logger.warn === 'function') {
      this._logger.warn(message, ...optionalParams)
    }
  }

  /**
   * @param {any} message
   * @param {any[]} optionalParams
   */
  info (message, ...optionalParams) {
    if (this._level >= LEVEL_INFO && typeof this._logger.info === 'function') {
      this._logger.info(message, ...optionalParams)
    }
  }

  /**
   * @param {any} message
   * @param {any[]} optionalParams
   */
  debug (message, ...optionalParams) {
    if (this._level >= LEVEL_DEBUG && typeof this._logger.debug === 'function') {
      this._logger.debug(message, ...optionalParams)
    }
  }
}
