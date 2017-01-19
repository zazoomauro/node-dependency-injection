import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'

class ContainerBuilder {

  constructor () {
    this._definitions = new Map()
  }

  /**
   * @param {string|number} id
   * @param {*} className
   * @param {Array} args
   * @returns {Definition}
   */
  register (id, className, args = []) {
    let definition = new Definition(className, args)
    this._definitions.set(id, definition)

    return definition
  }

  /**
   * @param {string} id
   */
  get (id) {
    let definition = this._definitions.get(id)

    if (definition) {
      return this.getInstanceFromDefinition(definition)
    }

    throw new Error('The service ' + id + ' is not registered')
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   */
  getInstanceFromDefinition (definition) {
    let args = []
    for (let argument of definition.arguments) {
      if (argument instanceof Reference) {
        args.push(this.get(argument.id))
      } else if (argument instanceof PackageReference) {
        args.push(require(argument.id))
      } else {
        args.push(argument)
      }
    }

    return new definition.Object(...args)
  }
}

export default ContainerBuilder
