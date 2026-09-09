import { describe, it } from 'mocha'
import chai from 'chai'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import TaggedReference from '../../../lib/TaggedReference'
import XmlFileLoader from '../../../lib/Loader/XmlFileLoader'

const assert = chai.assert

class FirstService {}
class SecondService {}
class Collector {
  constructor (services) {
    this.services = services
  }
}

describe('TaggedReference Symfony parity', () => {
  it('uses the first repeated tag occurrence for unindexed priority and includes the service once', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler', new Map([['priority', 30]]))
    first.addTag('app.handler', new Map([['priority', -10]]))

    const second = container.register('second', SecondService)
    second.addTag('app.handler', new Map([['priority', 20]]))

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler'))

    const services = container.get('collector').services

    assert.lengthOf(services, 2)
    assert.instanceOf(services[0], FirstService)
    assert.instanceOf(services[1], SecondService)
  })

  it('projects repeated tag occurrences separately when an index attribute is requested', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler', new Map([
      ['key', 'first-low'],
      ['priority', 10]
    ]))
    first.addTag('app.handler', new Map([
      ['key', 'first-high'],
      ['priority', 30]
    ]))

    const second = container.register('second', SecondService)
    second.addTag('app.handler', new Map([
      ['key', 'second'],
      ['priority', 20]
    ]))

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler', 'key'))

    const services = container.get('collector').services

    assert.deepEqual([...services.keys()], ['first-high', 'second', 'first-low'])
    assert.instanceOf(services.get('first-high'), FirstService)
    assert.instanceOf(services.get('first-low'), FirstService)
    assert.instanceOf(services.get('second'), SecondService)
  })

  it('accepts integer priorities encoded as strings at configuration boundaries', () => {
    const container = new ContainerBuilder()
    const loader = new XmlFileLoader(container)
    const [tag] = loader._transformTags([{
      '@_name': 'app.handler',
      '@_priority': '10'
    }])

    const first = container.register('first', FirstService)
    first.addTag(tag.name, new Map(Object.entries(tag.attributes)))

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler'))

    const services = container.get('collector').services

    assert.lengthOf(services, 1)
    assert.instanceOf(services[0], FirstService)
  })

  it('maps autowireAliasResolution through XML defaults', () => {
    const loader = new XmlFileLoader(new ContainerBuilder())
    const defaults = loader._transformDefaults({
      '@_autowire': 'true',
      '@_autowireAliasResolution': 'unique'
    })

    assert.isTrue(defaults.autowire)
    assert.strictEqual(defaults.autowireAliasResolution, 'unique')
  })
})
