import PassConfig from '../PassConfig'
import OptimizePass from './OptimizePass'
import RemovePass from './RemovePass'
import DecoratePass from './DecoratePass'
import ProcessMethodNotFoundException from '../Exception/ProcessMethodNotFoundException'
import WrongCompilerPassTypeException from '../Exception/WrongCompilerPassTypeException'

export default class CompilerPass {
  /**
   * @param {ContainerBuilder} container
   */
  constructor (container) {
    this._container = container
    this.beforeOptimization = []
    this.optimize = []
    this.beforeRemoving = []
    this.remove = []
    this.afterRemoving = []
  }

  /**
   * @param {string} type
   * @param {number} priority
   * @returns {number}
   */
  _getCompilerPassPriorityNumber (type, priority) {
    if (this[type][priority]) {
      return this._getCompilerPassPriorityNumber(type, priority + 1)
    }

    return priority
  }

  /**
   * @param {*} compilerPass
   * @param {string} type
   * @param {number} priority
   */
  register (compilerPass, type, priority) {
    if (typeof compilerPass.process !== 'function') {
      throw new ProcessMethodNotFoundException(compilerPass.constructor.name)
    }

    if (!PassConfig.isValidType(type)) {
      throw new WrongCompilerPassTypeException(type)
    }

    const arrayLevel = this._getCompilerPassPriorityNumber(type, priority)
    this[type][arrayLevel] = compilerPass
  }

  /**
   * @param {string} type
   * @private
   */
  async _checkAndAdd (type) {
    if (this._container._compilerPass[type].length === 0) {
      if (type === PassConfig.TYPE_BEFORE_OPTIMIZATION) {
        this.register(new DecoratePass(), type, 0)
      } else if (type === PassConfig.TYPE_OPTIMIZE) {
        this.register(new OptimizePass(), type, 0)
      } else if (type === PassConfig.TYPE_REMOVE) {
        this.register(new RemovePass(), type, 0)
      }
    }
  }

  /**
   * @param {string} type
   */
  async process (type) {
    await this._checkAndAdd(type)

    this[type] = this[type].filter((i) => {
      return i !== null
    })

    const promises = []
    for (const compilerPass of this[type]) {
      promises.push(compilerPass.process(this._container))
    }
    await Promise.all(promises)
  }
}
