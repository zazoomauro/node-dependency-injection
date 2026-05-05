import ServiceCircularReferenceException from './Exception/ServiceCircularReferenceException'
import PassConfig from './PassConfig'

export default class Compiler {
  /**
   * @param {ContainerBuilder} container
   */
  constructor (container) {
    this._container = container
  }

  async run () {
    const logger = this._container.loggerHelper
    try {
      if (!this._container.frozen) {
        logger.info('Compiling container...')
        await this._loadExtensions()
        await this._optimize()
        await this._remove()
        logger.info('Container compiled successfully')
      }
    } catch (error) {
      if (error instanceof RangeError) {
        throw new ServiceCircularReferenceException()
      }

      throw error
    }
  }

  /**
   * @private
   */
  async _loadExtensions () {
    const promises = []
    for (const extension of this._container.extensions) {
      promises.push(extension.load(this))
    }
    Promise.all(promises)
  }

  /**
   * @private
   */
  async _optimize () {
    this._container.loggerHelper.debug('Running compiler phase: beforeOptimization')
    await this._container._compilerPass.process(PassConfig.TYPE_BEFORE_OPTIMIZATION)
    this._container.loggerHelper.debug('Running compiler phase: optimize')
    await this._container._compilerPass.process(PassConfig.TYPE_OPTIMIZE)
  }

  /**
   * @private
   */
  async _remove () {
    this._container.loggerHelper.debug('Running compiler phase: beforeRemoving')
    await this._container._compilerPass.process(PassConfig.TYPE_BEFORE_REMOVING)
    this._container.loggerHelper.debug('Running compiler phase: remove')
    await this._container._compilerPass.process(PassConfig.TYPE_REMOVE)
    this._container.loggerHelper.debug('Running compiler phase: afterRemoving')
    await this._container._compilerPass.process(PassConfig.TYPE_AFTER_REMOVING)
  }
}
