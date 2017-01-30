import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'

class ContainerBuilder {

  constructor () {
    this._definitions = new Map()
    this._container = new Map()
    this._compiledContainer = new Map()
    this._frozen = false
    this._compilerPass = []
  }

  /**
   * @returns {boolean}
   */
  get frozen () {
    return this._frozen
  }

  /**
   * @param {string|number} id
   * @param {*} object
   * @param {Array} args
   * @returns {Definition}
   */
  register (id, object, args = []) {
    if (!this.frozen) {
      let definition = new Definition(object, args)

      return this.setDefinition(id, definition)
    }

    throw new Error('You cannot register more services when the container is frozen')
  }

  /**
   * @param {string} id
   */
  get (id) {
    if (this._compiledContainer.size > 0 && this._frozen) {
      return this._compiledContainer.get(id)
    }

    if (this._container.get(id)) {
      return this._container.get(id)
    }

    let definition = this._definitions.get(id)

    if (definition) {
      let instance = this.getInstanceFromDefinition(definition)
      this._container.set(id, instance)

      return instance
    }

    throw new Error('The service ' + id + ' is not registered')
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   */
  getInstanceFromDefinition (definition) {
    let args = this.resolveArguments(definition.arguments)
    let instance = new definition.Object(...args)

    for (let call of definition.calls) {
      this.callMethod(instance, call)
    }

    return instance
  }

  /**
   * @param {*} service
   * @param {{method, args}} call
   */
  callMethod (service, call) {
    if (typeof service[call.method] !== 'function') {
      return
    }

    let args = this.resolveArguments(call.args)

    service[call.method](...args)
  }

  /**
   * @param {Array} args
   * @returns {Array}
   */
  resolveArguments (args = []) {
    let resolvedArgument = []

    for (let argument of args) {
      resolvedArgument.push(this.resolveServices(argument))
    }

    return resolvedArgument
  }

  /**
   * @param {Reference|PackageReference|*} value
   * @returns {*}
   */
  resolveServices (value) {
    if (value instanceof Reference) {
      return this.get(value.id)
    } else if (value instanceof PackageReference) {
      return require(value.id)
    } else {
      return value
    }
  }

  compile () {
    for (let compilerPass of this._compilerPass) {
      compilerPass.process(this)
    }

    for (let [id, definition] of this._definitions) {
      if (this._container.get(id)) {
        this._compiledContainer.set(id, this._container.get(id))
      } else {
        this._compiledContainer.set(id, this.getInstanceFromDefinition(definition))
      }
    }

    this._frozen = true
  }

  /**
   * @param {*} compilerPass
   */
  addCompilerPass (compilerPass) {
    if (typeof compilerPass.process !== 'function') {
      throw new Error('Your compiler pass does not have the process method')
    }

    this._compilerPass.push(compilerPass)
  }

  /**
   * @param {string} alias
   * @param {string} id
   */
  setAlias (alias, id) {
    let definition = this.get(id)
    this._container.set(alias, definition)
  }

  /**
   * @param {string} id
   * @param {Definition} definition
   * @returns {Definition}
   */
  setDefinition (id, definition) {
    if (definition instanceof Definition) {
      this._definitions.set(id, definition)

      return definition
    }

    throw new Error('You cannot register not valid definition')
  }

  /**
   * @param {string} name
   * @returns {Map}
   */
  findTaggedServiceIds (name) {
    let taggedServices = new Map()
    for (let [id, definition] of this._definitions) {
      if (definition.tags.indexOf(name) > -1) {
        taggedServices.set(id, definition)
      }
    }

    return taggedServices
  }
}

export default ContainerBuilder
