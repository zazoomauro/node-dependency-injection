import { describe, it } from 'mocha'
import chai from 'chai'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Definition from '../../../lib/Definition'
import TagReference from '../../../lib/TagReference'
import TaggedReference from '../../../lib/TaggedReference'
import Argument from '../../../lib/Loader/Argument'

const assert = chai.assert

class FirstService {}
class SecondService {}
class Collector {
  constructor (services) {
    this.services = services
  }
}

describe('TaggedReference', () => {
  it('stores tag and optional index attribute', () => {
    const ref = new TaggedReference('app.handler', 'key')

    assert.strictEqual(ref.tag, 'app.handler')
    assert.strictEqual(ref.indexAttribute, 'key')
  })

  it('parses @tagged(tag) as the reference-style tagged form', () => {
    const ref = new Argument(new ContainerBuilder()).parse('@tagged(app.handler)')

    assert.instanceOf(ref, TaggedReference)
    assert.strictEqual(ref.tag, 'app.handler')
    assert.isNull(ref.indexAttribute)
  })

  it('parses @tagged(tag, indexAttribute) as an indexed tagged form', () => {
    const ref = new Argument(new ContainerBuilder()).parse('@tagged(app.handler, key)')

    assert.instanceOf(ref, TaggedReference)
    assert.strictEqual(ref.tag, 'app.handler')
    assert.strictEqual(ref.indexAttribute, 'key')
  })

  it('preserves !tagged as the legacy TagReference form', () => {
    const ref = new Argument(new ContainerBuilder()).parse('!tagged app.handler')

    assert.instanceOf(ref, TagReference)
    assert.notInstanceOf(ref, TaggedReference)
    assert.strictEqual(ref.name, 'app.handler')
  })

  it('orders @tagged members by priority while preserving definition order for ties', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler', new Map([['priority', 10]]))

    const second = container.register('second', SecondService)
    second.addTag('app.handler', new Map([['priority', 20]]))

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler'))

    const services = container.get('collector').services

    assert.lengthOf(services, 2)
    assert.instanceOf(services[0], SecondService)
    assert.instanceOf(services[1], FirstService)
  })

  it('projects indexed @tagged members as a Map using tag attributes', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler', new Map([
      ['key', 'first-handler'],
      ['priority', 10]
    ]))

    const second = container.register('second', SecondService)
    second.addTag('app.handler', new Map([
      ['key', 'second-handler'],
      ['priority', 20]
    ]))

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler', 'key'))

    const services = container.get('collector').services

    assert.instanceOf(services, Map)
    assert.deepEqual([...services.keys()], ['second-handler', 'first-handler'])
    assert.instanceOf(services.get('second-handler'), SecondService)
    assert.instanceOf(services.get('first-handler'), FirstService)
  })

  it('falls back to the service id when an indexed tag omits the index attribute', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler')

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler', 'key'))

    const services = container.get('collector').services

    assert.instanceOf(services.get('first'), FirstService)
  })

  it('leaves !tagged ordering unchanged and ignores priority metadata', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler', new Map([['priority', 10]]))

    const second = container.register('second', SecondService)
    second.addTag('app.handler', new Map([['priority', 20]]))

    container.register('collector', Collector)
      .addArgument(new TagReference('app.handler'))

    const services = container.get('collector').services

    assert.instanceOf(services[0], FirstService)
    assert.instanceOf(services[1], SecondService)
  })

  it('rejects non-integer priority in the new Symfony-style form', () => {
    const container = new ContainerBuilder()

    const first = container.register('first', FirstService)
    first.addTag('app.handler', new Map([['priority', 'high']]))

    container.register('collector', Collector)
      .addArgument(new TaggedReference('app.handler'))

    assert.throws(
      () => container.get('collector'),
      TypeError,
      "Tag 'app.handler' on service 'first' has non-integer priority 'high'"
    )
  })
})
