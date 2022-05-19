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
    try {
      if (!this._container.frozen) {
        await this._loadExtensions()
        await this._optimize()
        await this._remove()
      }
    } catch (error) {
      if (error instanceof RangeError) {
        throw new ServiceCircularReferenceException()
      }
    }
  }

  /**
   * @private
   */
  async _loadExtensions () {
    for (const extension of this._container.extensions) {
      await extension.load(this)
    }
  }

  /**
   * @private
   */
  async _optimize () {
    await this._container._compilerPass.process(PassConfig.TYPE_BEFORE_OPTIMIZATION)
    await this._container._compilerPass.process(PassConfig.TYPE_OPTIMIZE)
  }

  /**
   * @private
   */
  async _remove () {
    await this._container._compilerPass.process(PassConfig.TYPE_BEFORE_REMOVING)
    await this._container._compilerPass.process(PassConfig.TYPE_REMOVE)
    await this._container._compilerPass.process(PassConfig.TYPE_AFTER_REMOVING)
  }
}
