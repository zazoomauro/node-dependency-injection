import PassConfig from '../PassConfig'
import OptimizePass from './OptimizePass'
import RemovePass from './RemovePass'
import DecoratePass from './DecoratePass'

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
      throw new Error('Your compiler pass must implement the process method')
    }

    if (!PassConfig.isValidType(type)) {
      throw new Error(`${type} is a wrong compiler pass config type`)
    }

    const arrayLevel = this._getCompilerPassPriorityNumber(type, priority)
    this[type][arrayLevel] = compilerPass
  }

  /**
   * @param {string} type
   * @private
   */
  _checkAndAdd (type) {
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
  process (type) {
    this._checkAndAdd(type)

    this[type] = this[type].filter((i) => {
      return i !== null
    })

    for (let compilerPass of this[type]) {
      compilerPass.process(this._container)
    }
  }
}
