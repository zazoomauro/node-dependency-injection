import { describe, it } from 'mocha'
import chai from 'chai'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import KeyedGroupMultipleDefaultsException from '../../../lib/Exception/KeyedGroupMultipleDefaultsException'

const assert = chai.assert

class FirstService {}
class SecondService {}

describe('Keyed default semantics', () => {
  it('allows plural keyed groups with no default', () => {
    const container = new ContainerBuilder()
    container.registerKeyed('strategy', 'first', FirstService)
    container.registerKeyed('strategy', 'second', SecondService)

    const group = container.getKeyedGroup('strategy')

    assert.strictEqual(group.size, 2)
    assert.instanceOf(group.get('first'), FirstService)
    assert.instanceOf(group.get('second'), SecondService)
  })

  it('requires a default only when singular default resolution is requested', () => {
    const container = new ContainerBuilder()
    container.registerKeyed('strategy', 'first', FirstService)
    container.registerKeyed('strategy', 'second', SecondService)

    assert.throws(
      () => container.getKeyed('strategy'),
      "No default keyed service found for group 'strategy'"
    )
  })

  it('rejects multiple asserted defaults instead of selecting by registration order', () => {
    const container = new ContainerBuilder()
    container.registerKeyed('strategy', 'first', FirstService).setDefault(true)
    container.registerKeyed('strategy', 'second', SecondService).setDefault(true)

    assert.throws(
      () => container.getKeyed('strategy'),
      KeyedGroupMultipleDefaultsException,
      "Multiple default keyed services found for group 'strategy'"
    )
  })
})
