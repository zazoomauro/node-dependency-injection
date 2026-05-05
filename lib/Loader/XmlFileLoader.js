import FileLoader from './FileLoader'
import { XMLParser } from 'fast-xml-parser'
import * as fs from 'fs/promises'
import ServiceFileNotFoundException from '../Exception/ServiceFileNotFoundException'
import ServiceFileNotLoadedException from '../Exception/ServiceFileNotLoadedException'

export default class XmlFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  async load (file = null) {
    super.filePath = file
    this._container.loggerHelper.info(`Loading XML file: ${file}`)

    let rawContent

    try {
      rawContent = await fs.readFile(this.filePath, 'utf8')
    } catch (e) {
      throw new ServiceFileNotFoundException(this.filePath)
    }

    let parsed

    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        isArray: (name) => ['import', 'service', 'argument', 'tag', 'call', 'property', 'parameter'].includes(name),
        allowBooleanAttributes: true
      })
      parsed = parser.parse(rawContent)
    } catch (e) {
      throw new ServiceFileNotLoadedException(e.message)
    }

    const container = parsed.container || {}

    const imports = this._transformImports(container.imports)
    const parameters = this._transformParameters(container.parameters)
    const services = this._transformServices(container.services)

    await this._parseImports(imports)
    await this._parseParameters(parameters)
    await this._parseDefinitions(services)
  }

  /**
   * @param {*} importsNode
   * @returns {Array<{resource: string}>}
   * @private
   */
  _transformImports (importsNode) {
    if (!importsNode || !importsNode.import) {
      return []
    }
    return importsNode.import.map((imp) => ({ resource: imp['@_resource'] }))
  }

  /**
   * @param {*} parametersNode
   * @returns {Object}
   * @private
   */
  _transformParameters (parametersNode) {
    if (!parametersNode || !parametersNode.parameter) {
      return {}
    }

    const result = {}
    for (const param of parametersNode.parameter) {
      const key = param['@_key']
      if (key === undefined) {
        continue
      }
      result[key] = this._parseParameterValue(param)
    }
    return result
  }

  /**
   * @param {*} param
   * @returns {*}
   * @private
   */
  _parseParameterValue (param) {
    const type = param['@_type']

    if (type === 'collection') {
      // array of items — each child <parameter> has no key
      return (param.parameter || []).map((p) => this._parseParameterValue(p))
    }

    if (type === 'map') {
      // object — each child <parameter> has a key attribute
      const obj = {}
      for (const child of (param.parameter || [])) {
        obj[child['@_key']] = this._parseParameterValue(child)
      }
      return obj
    }

    if (type === 'boolean') {
      const val = String(param['#text'] ?? param).trim().toLowerCase()
      return val === 'true'
    }

    // plain value
    const raw = param['#text'] ?? param
    if (raw === undefined || raw === null) {
      return raw
    }
    return String(raw)
  }

  /**
   * @param {*} servicesNode
   * @returns {Object}
   * @private
   */
  _transformServices (servicesNode) {
    if (!servicesNode) {
      return {}
    }

    const result = {}

    // Handle _defaults
    if (servicesNode.defaults) {
      result._defaults = this._transformDefaults(servicesNode.defaults)
    }

    for (const svc of (servicesNode.service || [])) {
      const id = svc['@_id']
      if (id === undefined) {
        continue
      }

      // Alias
      if (svc['@_alias'] !== undefined) {
        result[id] = `@${svc['@_alias']}`
        continue
      }

      // Synthetic
      if (svc['@_synthetic'] === true || svc['@_synthetic'] === 'true') {
        result[id] = { synthetic: true }
        continue
      }

      result[id] = this._transformService(svc)
    }

    return result
  }

  /**
   * @param {*} defaultsNode
   * @returns {Object}
   * @private
   */
  _transformDefaults (defaultsNode) {
    const defaults = {}

    if (defaultsNode['@_autowire'] !== undefined) {
      defaults.autowire = defaultsNode['@_autowire'] === 'true' || defaultsNode['@_autowire'] === true
    }
    if (defaultsNode['@_dir'] !== undefined) {
      defaults.rootDir = defaultsNode['@_dir']
    }

    if (defaultsNode.bind) {
      const binds = Array.isArray(defaultsNode.bind) ? defaultsNode.bind : [defaultsNode.bind]
      defaults.bind = {}
      for (const b of binds) {
        defaults.bind[b['@_prefix']] = b['@_path']
      }
    }

    if (defaultsNode.exclude) {
      const excludes = Array.isArray(defaultsNode.exclude) ? defaultsNode.exclude : [defaultsNode.exclude]
      defaults.exclude = excludes.map((e) => e['@_pattern'] || e)
    }

    return defaults
  }

  /**
   * @param {*} svc
   * @returns {Object}
   * @private
   */
  _transformService (svc) {
    const service = {}

    if (svc['@_class'] !== undefined) {
      service.class = svc['@_class']
    }
    if (svc['@_main'] !== undefined) {
      service.main = svc['@_main']
    }
    if (svc['@_lazy'] !== undefined) {
      service.lazy = svc['@_lazy'] === 'true' || svc['@_lazy'] === true
    }
    if (svc['@_public'] !== undefined) {
      service.public = svc['@_public'] !== 'false' && svc['@_public'] !== false
    }
    if (svc['@_shared'] !== undefined) {
      service.shared = svc['@_shared'] !== 'false' && svc['@_shared'] !== false
    }
    if (svc['@_abstract'] !== undefined) {
      service.abstract = svc['@_abstract'] === 'true' || svc['@_abstract'] === true
    }
    if (svc['@_parent'] !== undefined) {
      service.parent = svc['@_parent']
    }
    if (svc['@_decorates'] !== undefined) {
      service.decorates = svc['@_decorates']
    }
    if (svc['@_decoration-priority'] !== undefined) {
      service.decoration_priority = Number(svc['@_decoration-priority'])
    }
    if (svc['@_deprecated'] !== undefined) {
      service.deprecated = svc['@_deprecated']
    }

    service.arguments = this._transformArguments(svc.argument)
    service.tags = this._transformTags(svc.tag)
    service.calls = this._transformCalls(svc.call)
    service.properties = this._transformProperties(svc.property)

    // Factory
    if (svc.factory) {
      service.factory = {}
      const factoryClass = svc.factory['@_class'] ?? svc.factory['@_service']
      if (factoryClass !== undefined) {
        service.factory.class = factoryClass
      }
      if (svc.factory['@_method'] !== undefined) {
        service.factory.method = svc.factory['@_method']
      }
      if (svc.factory['@_main'] !== undefined) {
        service.factory.main = svc.factory['@_main']
      }
    }

    return service
  }

  /**
   * @param {Array|undefined} argNodes
   * @returns {Array}
   * @private
   */
  _transformArguments (argNodes) {
    if (!argNodes || argNodes.length === 0) {
      return []
    }
    return argNodes.map((arg) => {
      const type = arg['@_type']
      if (type === 'tagged') {
        return `!tagged ${arg['#text'] ?? arg}`
      }
      if (type === 'boolean') {
        const val = String(arg['#text'] ?? arg).trim().toLowerCase()
        return val === 'true'
      }
      const raw = arg['#text'] ?? arg
      return raw === undefined || raw === null ? '' : String(raw)
    })
  }

  /**
   * @param {Array|undefined} tagNodes
   * @returns {Array}
   * @private
   */
  _transformTags (tagNodes) {
    if (!tagNodes || tagNodes.length === 0) {
      return []
    }
    return tagNodes.map((tag) => {
      const name = tag['@_name']
      // All attributes except @_name become tag attributes
      const attributes = {}
      for (const key of Object.keys(tag)) {
        if (key !== '@_name' && key.startsWith('@_')) {
          attributes[key.slice(2)] = tag[key]
        }
      }
      const result = { name }
      if (Object.keys(attributes).length > 0) {
        result.attributes = attributes
      }
      return result
    })
  }

  /**
   * @param {Array|undefined} callNodes
   * @returns {Array}
   * @private
   */
  _transformCalls (callNodes) {
    if (!callNodes || callNodes.length === 0) {
      return []
    }
    return callNodes.map((call) => ({
      method: call['@_method'],
      arguments: this._transformArguments(call.argument)
    }))
  }

  /**
   * @param {Array|undefined} propertyNodes
   * @returns {Object}
   * @private
   */
  _transformProperties (propertyNodes) {
    if (!propertyNodes || propertyNodes.length === 0) {
      return {}
    }
    const result = {}
    for (const prop of propertyNodes) {
      result[prop['@_name']] = String(prop['#text'] ?? prop)
    }
    return result
  }
}
