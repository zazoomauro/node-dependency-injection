import BaseAdapter from './BaseAdapter'
import { XMLBuilder } from 'fast-xml-parser'

export default class XmlAdapter extends BaseAdapter {
  /**
   * @return {string}
   */
  static get FORMAT () {
    return 'xml'
  }

  /**
   * @return {string}
   */
  get defaultConfiguration () {
    const config = super.defaultConfiguration
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '    '
    })

    const serviceNodes = []
    for (const [id, svc] of Object.entries(config.services)) {
      const node = { '@_id': id, '@_class': svc.class }
      if (svc.arguments && svc.arguments.length > 0) {
        node.argument = svc.arguments.map((arg) => ({ '#text': arg }))
      }
      serviceNodes.push(node)
    }

    const xmlData = {
      '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
      container: {
        imports: {
          import: config.imports.map((imp) => ({ '@_resource': imp.resource }))
        },
        parameters: {
          parameter: Object.entries(config.parameters).map(([key, value]) => ({
            '@_key': key,
            '#text': value
          }))
        },
        services: {
          service: serviceNodes
        }
      }
    }

    return `${builder.build(xmlData)}\n`
  }
}
