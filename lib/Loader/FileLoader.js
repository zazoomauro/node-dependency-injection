import path from 'path'
import { pathToFileURL } from 'url'
import Reference from './../Reference'
import Definition from './../Definition'
import validate from 'validate-npm-package-name'
import Autowire from '../Autowire'
import Argument from './Argument'
import Condition from '../Condition'

class FileLoader {
  /**
   * @param {ContainerBuilder} container
   */
  constructor (container) {
    this._container = container
  }

  /**
   * @returns {ContainerBuilder}
   */
  get container () {
    return this._container
  }

  /**
   * @returns {string}
   */
  get filePath () {
    return this._filePath
  }

  /**
   * @param {string} value
   */
  set filePath (value) {
    this._filePath = value
  }

  /**
   * @param {*} attributes
   * @returns Map
   * @private
   */
  static _parseTagAttributes (attributes) {
    const map = new Map()

    if (attributes) {
      for (const key of Object.keys(attributes)) {
        map.set(key, attributes[key])
      }
    }

    return map
  }

  /**
   * @param {Array<*>} services
   *
   * @protected
   */
  async _parseDefinitions (services = []) {
    for (const id in services) {
      if (id === '_defaults') {
        await this._parseDefaults(services._defaults)
      } else {
        this._container.loggerHelper.debug(`Parsing service definition: ${id}`)
        await this._parseDefinition(services, id)
      }
    }
  }

  /**
   * @param {*} services
   * @param {string} id
   * @private
   */
  async _parseDefinition (services, id) {
    const service = services[id]

    if (typeof service === 'string') {
      this.container.setAlias(id, service.slice(1))
    } else if (service.factory) {
      this.container.setDefinition(id, await this._getFactoryDefinition(service))
    } else {
      const definition = await this._getDefinition(service)
      this.container.setDefinition(id, definition)
      if (service.keyed) {
        const { group, key } = service.keyed
        const isDefault = service.keyed.default === true
        definition.keyedGroup = group
        definition.keyedKey = key
        definition.keyedDefault = isDefault
        this.container._addToKeyedGroup(group, key, id)
      }
    }
  }

  /**
   * @param {*} service
   * @returns {Definition}
   * @private
   */
  async _getFactoryDefinition (service) {
    let object = null

    if (service.factory.class.includes('@', 0)) {
      object = new Reference(service.factory.class.slice(1))
    } else {
      object = await this._requireClassNameFromPath(service.factory.class, service.factory.main)
    }

    const definition = new Definition()
    definition.shared = service.shared
    definition.setFactory(object, service.factory.method)
    definition.args = this._getParsedArguments(service.arguments)

    return definition
  }

  /**
   * @param {*} service
   * @returns {Definition}
   * @private
   */
  async _getDefinition (service) {
    let definition

    if (!service.synthetic) {
      const object = await this._requireClassNameFromPath(service.class, service.main)
      definition = new Definition(object)
      definition.lazy = service.lazy || false
      definition.public = service.public !== false
      definition.abstract = service.abstract || false
      definition.parent = service.parent
      definition.decoratedService = service.decorates
      definition.decorationPriority = service.decoration_priority
      definition.deprecated = service.deprecated
      definition.shared = service.shared

      this._parseArguments(definition, service.arguments)
      this._parseOverrideArguments(definition, service.override_arguments)
      this._parseProperties(definition, service.properties)
      this._parseCalls(definition, service.calls)
      this._parseTags(definition, service.tags)
      this._parseWhen(definition, service.when)
    } else {
      definition = new Definition()
      definition.synthetic = true
    }

    return definition
  }

  /**
   * Parse the `when` key of a service definition and apply the corresponding
   * condition to the given definition.
   *
   * Supported keys inside `when`:
   *   - env_exists: <VAR>
   *   - env_equals: { var: <VAR>, value: <VALUE> }
   *   - missing: <service-id>
   *   - service_exists: <service-id>
   *
   * @param {Definition} definition
   * @param {Object|undefined} when
   * @private
   */
  _parseWhen (definition, when) {
    if (!when || typeof when !== 'object') {
      return
    }

    if (when.env_exists !== undefined) {
      definition.setCondition(Condition.envExists(when.env_exists))
    } else if (when.env_equals !== undefined) {
      definition.setCondition(Condition.envEquals(when.env_equals.var, when.env_equals.value))
    } else if (when.missing !== undefined) {
      definition.whenMissing(when.missing)
    } else if (when.service_exists !== undefined) {
      definition.whenServiceExists(when.service_exists)
    }
  }

  /**
   * @param {Definition} definition
   * @param {Array} calls
   * @private
   */
  _parseCalls (definition, calls = []) {
    calls.forEach((call) => {
      definition.addMethodCall(call.method,
        this._getParsedArguments(call.arguments))
    })
  }

  /**
   * @param {Definition} definition
   * @param {Array} tags
   * @private
   */
  _parseTags (definition, tags = []) {
    tags.forEach((tag) => {
      definition.addTag(tag.name,
        FileLoader._parseTagAttributes(tag.attributes))
    })
  }

  /**
   * @param {Array} args
   * @returns {Array}
   * @private
   */
  _getParsedArguments (args = []) {
    const parsedArguments = []
    for (const argument of args) {
      parsedArguments.push(
        new Argument(this.container).parse(argument)
      )
    }
    return parsedArguments
  }

  async _parseDefaults (defaults = {}) {
    if (!defaults || !defaults.autowire) {
      return
    }
    if (!path.isAbsolute(defaults.rootDir)) {
      const filePathParsed = path.parse(this.filePath)
      this._container.defaultDir = path.join(filePathParsed.dir, defaults.rootDir)
    } else {
      this._container.defaultDir = defaults.rootDir
    }
    if (defaults.bind && typeof defaults.bind === 'object') {
      for (const [name, value] of Object.entries(defaults.bind)) {
        this._container.addBind(name, new Argument(this._container).parse(value))
      }
    }
    const autowire = new Autowire(this._container)
    if (defaults.exclude && Array.isArray(defaults.exclude)) {
      defaults.exclude.forEach(exclude => {
        autowire.addExclude(exclude)
      })
    }
    await autowire.process()
  }

  /**
   * @param {Definition} definition
   * @param {Object} properties
   * @private
   */
  _parseProperties (definition, properties = {}) {
    for (const propertyKey in properties) {
      definition.addProperty(
        propertyKey,
        new Argument(this.container).parse(properties[propertyKey])
      )
    }
  }

  /**
   * @param {Array<{resource}>} imports
   *
   * @protected
   */
  async _parseImports (imports = []) {
    for (const file of imports) {
      const workingPath = this.filePath
      const importPath = path.join(path.dirname(this.filePath), file.resource)
      this._container.loggerHelper.debug(`Importing file: ${importPath}`)
      await this.load(importPath)
      this.filePath = workingPath
    }
  }

  /**
   * @param {*} parameters
   *
   * @protected
   */
  async _parseParameters (parameters = {}) {
    for (const key in parameters) {
      this._container.setParameter(key, parameters[key])
    }
  }

  /**
   * @param {Definition} definition
   * @param {Array} args
   *
   * @private
   */
  _parseArguments (definition, args = []) {
    const argument = (definition.abstract) ? 'appendArgs' : 'args'
    definition[argument] = this._getParsedArguments(args)
  }

  /**
   * @param {Definition} definition
   * @param {Array} args
   *
   * @private
   */
  _parseOverrideArguments (definition, args = []) {
    definition.overrideArgs = this._getParsedArguments(args)
  }

  /**
   * @param {string} classObject
   * @param {string} mainClassName
   * @returns {*}
   *
   * @private
   */
  async _requireClassNameFromPath (classObject, mainClassName) {
    // Normalize legacy slash-prefixed single-segment class references (e.g. '/Kernel' → 'Kernel').
    // These are distinguished from real absolute paths by having only one path segment after '/'.
    const normalizedClass = (classObject && classObject.startsWith('/') && classObject.lastIndexOf('/') === 0)
      ? classObject.slice(1)
      : classObject

    const fromDirectory = this._getFromDirectoryByClassObject(normalizedClass)
    const exportedModule = await this._getExportedModule(fromDirectory, normalizedClass)

    const mainClass = exportedModule[mainClassName]
    const defaultClass = exportedModule.default
    const fileNameClass = exportedModule[path.basename(normalizedClass)]
    return mainClass || defaultClass || fileNameClass || exportedModule
  }

  /**
   * @param {string} fromDirectory
   * @param {string} classObject
   * @returns {*}
   *
   * @private
   */
  async _getExportedModule (fromDirectory, classObject) {
    const modulePath = path.join(fromDirectory, classObject)
    try {
      return await this._loadModule(modulePath)
    } catch (error) {
      if (
        error.code === 'MODULE_NOT_FOUND' &&
        validate(classObject)
      ) {
        return this._loadModule(classObject)
      }
      throw error
    }
  }

  async _loadModule (modulePath) {
    try {
      return require(modulePath)
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw error
      }
      const isAbsoluteModulePath = path.isAbsolute(modulePath)
      const moduleSpecifier = isAbsoluteModulePath
        ? pathToFileURL(require.resolve(modulePath)).href
        : modulePath
      return import(moduleSpecifier)
    }
  }

  /**
   * @param {string} classObject
   * @returns {string}
   *
   * @private
   */
  _getFromDirectoryByClassObject (classObject) {
    const fromDirectory = (!path.isAbsolute(classObject)) ? path.dirname(this.filePath) : '/'
    return this.container.defaultDir || fromDirectory
  }
}

export default FileLoader
