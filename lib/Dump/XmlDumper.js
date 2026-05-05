import fs from 'fs/promises'
import { XMLBuilder } from 'fast-xml-parser'
import Dumper from './Dumper'

export default class XmlDumper extends Dumper {
  async dump () {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
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
        // alias
        nodes.push({
          '@_id': id,
          '@_alias': service.slice(1)
        })
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
        if (service.arguments && service.arguments.length > 0) {
          node.argument = service.arguments.map((arg) => ({ '#text': arg }))
        }
        nodes.push(node)
      }
    }
    return nodes
  }
}
