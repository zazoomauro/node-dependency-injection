import ServiceCircularReferenceException from './Exception/ServiceCircularReferenceException'
import PassConfig from './PassConfig'
import Condition from './Condition'

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
        this._evaluateConditions()
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
   * Evaluate all conditions on registered definitions and remove those that
   * do not pass. Uses a two-phase approach:
   *
   * Phase 1: evaluate env_exists / env_equals / custom / all / any conditions.
   * Phase 2: evaluate missing / service_exists conditions (depend on phase-1 results).
   *
   * @private
   */
  _evaluateConditions () {
    const logger = this._container.loggerHelper
    const definitions = this._container.definitions

    // Phase 1: evaluate independent conditions
    for (const [id, definition] of definitions) {
      const condition = definition.condition
      if (condition !== null && !condition.evaluate()) {
        logger.debug(`Removing service "${id}": condition not met`)
        definitions.delete(id)
      }
    }

    // Phase 2: evaluate service-existence conditions against the remaining set
    const remainingIds = new Set(definitions.keys())
    for (const [id, definition] of definitions) {
      if (definition.whenMissingId !== null) {
        const cond = new Condition('missing', { id: definition.whenMissingId })
        if (!cond.evaluatePhaseTwo(remainingIds)) {
          logger.debug(`Removing service "${id}": whenMissing("${definition.whenMissingId}") condition not met`)
          definitions.delete(id)
          continue
        }
      }
      if (definition.whenServiceExistsId !== null) {
        const cond = new Condition('service_exists', { id: definition.whenServiceExistsId })
        if (!cond.evaluatePhaseTwo(remainingIds)) {
          logger.debug(`Removing service "${id}": whenServiceExists("${definition.whenServiceExistsId}") condition not met`)
          definitions.delete(id)
        }
      }
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
    await Promise.all(promises)
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
