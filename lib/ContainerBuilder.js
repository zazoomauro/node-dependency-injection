import Definition from './Definition'
import Map from 'collections/map'
import Reference from './Reference'
import PackageReference from './PackageReference'

class ContainerBuilder {

  constructor () {
    this._definitions = new Map()
    this._container = new Map()
    this._frozen = false
    this._compilerPass = []
    this._parameters = new Map()
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
    if (this._container.get(id)) {
      return this._container.get(id)
    }

    let definition = this._definitions.get(id)

    if (definition) {
      let instance = this._getInstanceFromDefinition(definition)
      this._container.set(id, instance)

      return instance
    }

    throw new Error('The service ' + id + ' is not registered')
  }

  /**
   * @param {Definition} definition
   * @returns {*}
   *
   * @private
   */
  _getInstanceFromDefinition (definition) {
    let args = this._resolveArguments(definition.args)
    let instance = new definition.Object(...args)

    for (let call of definition.calls) {
      this._callMethod(instance, call)
    }

    return instance
  }

  /**
   * @param {*} service
   * @param {{method, args}} call
   *
   * @private
   */
  _callMethod (service, call) {
    if (typeof service[call.method] !== 'function') {
      return
    }

    let args = this._resolveArguments(call.args)

    service[call.method](...args)
  }

  /**
   * @param {Array} args
   * @returns {Array}
   *
   * @private
   */
  _resolveArguments (args = []) {
    let resolvedArgument = []

    for (let argument of args) {
      resolvedArgument.push(this._resolveServices(argument))
    }

    return resolvedArgument
  }

  /**
   * @param {Reference|PackageReference|*} value
   * @returns {*}
   *
   * @private
   */
  _resolveServices (value) {
    if (value instanceof Reference) {
      return this.get(value.id)
    } else if (value instanceof PackageReference) {
      return require(value.id)
    } else {
      return value
    }
  }

  compile () {
    if (!this._frozen) {
      for (let compilerPass of this._compilerPass) {
        compilerPass.process(this)
      }

      for (let [id, definition] of this._definitions) {
        if (!this._container.get(id)) {
          this._container.set(id, this._getInstanceFromDefinition(definition))
        }
      }

      this._frozen = true
    }
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

  /**
   * @param {string} key
   * @param {string|Array} value
   */
  setParameter (key, value) {
    if (typeof value !== 'string' && !Array.isArray(value)) {
      throw new TypeError('The expected value is not a flat string or an array')
    }

    this._parameters.set(key, value)
  }

  /**
   * @param {string} key
   * @returns {string|Array}
   */
  getParameter (key) {
    return this._parameters.get(key)
  }

  /**
   * @param {string} key
   * @returns {boolean}
   */
  hasParameter (key) {
    return this._parameters.has(key)
  }
}

export default ContainerBuilder
