import fs from 'fs/promises'
import { XMLBuilder } from 'fast-xml-parser'
import Dumper from './Dumper'

export default class XmlDumper extends Dumper {
  async dump () {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      suppressBooleanAttributes: false,
      format: true,
      indentBy: '    '
    })

    const xmlData = {
      '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
      container: {
        services: {
          service: this._buildServiceNodes()
        }
      }
    }

    const dataContent = `${builder.build(xmlData)}\n`
    await fs.writeFile(this._serviceFile, dataContent, { encoding: 'utf8' })
  }

  /**
   * @returns {Array}
   * @private
   */
  _buildServiceNodes () {
    const nodes = []
    for (const [id, service] of Object.entries(this._content.services)) {
      if (typeof service === 'string') {
        // Alias entry: service value is e.g. "@foo" → strip the @
        nodes.push({
          '@_id': id,
          '@_alias': service.slice(1)
        })
      } else if (service.synthetic === true) {
        nodes.push({ '@_id': id, '@_synthetic': 'true' })
      } else {
        const node = { '@_id': id }

        if (service.class !== undefined) {
          node['@_class'] = service.class
        }
        if (service.abstract === true) {
          node['@_abstract'] = 'true'
        }
        if (service.parent !== undefined) {
          node['@_parent'] = service.parent
        }
        if (service.lazy === true) {
          node['@_lazy'] = 'true'
        }
        if (service.public === false) {
          node['@_public'] = 'false'
        }
        if (service.shared === false) {
          node['@_shared'] = 'false'
        }
        if (service.deprecated !== undefined && service.deprecated !== null) {
          node['@_deprecated'] = service.deprecated
        }
        if (service.decorates !== undefined && service.decorates !== null) {
          node['@_decorates'] = service.decorates
        }
        if (service.decoration_priority !== undefined && service.decoration_priority !== null) {
          node['@_decoration-priority'] = service.decoration_priority
        }

        if (service.arguments && service.arguments.length > 0) {
          node.argument = service.arguments.map((arg) => this._buildArgumentNode(arg))
        }

        if (service.tags && service.tags.length > 0) {
          node.tag = service.tags.map((tag) => {
            const tagNode = { '@_name': tag.name }
            if (tag.attributes) {
              for (const [k, v] of Object.entries(tag.attributes)) {
                tagNode[`@_${k}`] = v
              }
            }
            return tagNode
          })
        }

        if (service.calls && service.calls.length > 0) {
          node.call = service.calls.map((call) => {
            const callNode = { '@_method': call.method }
            if (call.arguments && call.arguments.length > 0) {
              callNode.argument = call.arguments.map((arg) => this._buildArgumentNode(arg))
            }
            return callNode
          })
        }

        if (service.properties && Object.keys(service.properties).length > 0) {
          node.property = Object.entries(service.properties).map(([name, value]) => ({
            '@_name': name,
            '#text': String(value)
          }))
        }

        if (service.factory) {
          const factoryNode = { '@_method': service.factory.method }
          if (service.factory.class && service.factory.class.startsWith('@')) {
            factoryNode['@_service'] = service.factory.class
          } else {
            factoryNode['@_class'] = service.factory.class
          }
          node.factory = factoryNode
        }

        nodes.push(node)
      }
    }
    return nodes
  }

  /**
   * Build a single <argument> node for the given value.
   *
   * @param {*} arg
   * @returns {Object}
   * @private
   */
  _buildArgumentNode (arg) {
    if (typeof arg === 'boolean') {
      return { '@_type': 'boolean', '#text': String(arg) }
    }
    if (typeof arg === 'string' && arg.startsWith('!tagged ')) {
      return { '@_type': 'tagged', '#text': arg.slice(8) }
    }
    return { '#text': String(arg) }
  }
}
