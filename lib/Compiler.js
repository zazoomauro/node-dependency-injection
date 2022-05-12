import ServiceCircularReferenceException from './Exception/ServiceCircularReferenceException'
import PassConfig from './PassConfig'

export default class Compiler {
  /**
   * @param {ContainerBuilder} container
   */
  constructor (container) {
    this._container = container
  }

  run () {
    try {
      if (!this._container.frozen) {
        this._loadExtensions()
        this._optimize()
        this._remove()
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
  _loadExtensions () {
    for (const extension of this._container.extensions) {
      extension.load(this)
    }
  }

  /**
   * @private
   */
  _optimize () {
    this._container._compilerPass.process(PassConfig.TYPE_BEFORE_OPTIMIZATION)
    this._container._compilerPass.process(PassConfig.TYPE_OPTIMIZE)
  }

  /**
   * @private
   */
  _remove () {
    this._container._compilerPass.process(PassConfig.TYPE_BEFORE_REMOVING)
    this._container._compilerPass.process(PassConfig.TYPE_REMOVE)
    this._container._compilerPass.process(PassConfig.TYPE_AFTER_REMOVING)
  }
}
