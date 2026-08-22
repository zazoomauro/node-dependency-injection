import { describe, it } from 'mocha'
import chai from 'chai'
import path from 'path'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Autowire from '../../../lib/Autowire'
import Reference from '../../../lib/Reference'
import PassConfig from '../../../lib/PassConfig'
import AmbiguousAutowireException from '../../../lib/Exception/AmbiguousAutowireException'
import FirstStrategy from '../../Resources-ts/Autowire-Ambiguous/src/Service/FirstStrategy'
import SecondStrategy from '../../Resources-ts/Autowire-Ambiguous/src/Service/SecondStrategy'

const assert = chai.assert
const strategyAlias = 'Interface/Strategy'
const firstStrategy = 'Service/FirstStrategy'
const secondStrategy = 'Service/SecondStrategy'

const fixtureRoot = () => path.join(
  __dirname,
  '..',
  '..',
  'Resources-ts',
  'Autowire-Ambiguous',
  'src'
)

describe('Autowire alias resolution', () => {
  it('preserves first-discovered alias resolution as the default', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)

    assert.strictEqual(autowire.autowireAliasResolution, 'first')

    await autowire.process()

    assert.isTrue(container.hasAlias(strategyAlias))
    await container.compile()
    assert.oneOf(container.get('Consumer').selected(), ['first', 'second'])
  })

  it('rejects unknown alias-resolution policies', () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)

    assert.throws(
      () => { autowire.autowireAliasResolution = 'surprise-me' },
      TypeError,
      'Invalid autowireAliasResolution'
    )
  })

  it('first-or-unique repairs an invalid first-discovered alias when one candidate survives', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'first-or-unique'

    await autowire.process()

    const originallySelected = container._alias.get(strategyAlias)
    const survivor = originallySelected === firstStrategy ? secondStrategy : firstStrategy

    container.addCompilerPass({
      process (compiledContainer) {
        compiledContainer.removeDefinition(originallySelected)
      }
    }, PassConfig.TYPE_BEFORE_OPTIMIZATION)

    await container.compile()

    assert.strictEqual(container._alias.get(strategyAlias), survivor)
    assert.strictEqual(
      container.get('Consumer').selected(),
      survivor === firstStrategy ? 'first' : 'second'
    )
  })

  it('unique creates an alias only after the compiled graph has one surviving candidate', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'unique'
    autowire.addExclude('/Consumer.ts')
    autowire.addExclude('/Service/SecondStrategy.ts')

    await autowire.process()

    assert.isFalse(container.hasAlias(strategyAlias))

    await container.compile()

    assert.isTrue(container.hasAlias(strategyAlias))
    assert.strictEqual(container._alias.get(strategyAlias), firstStrategy)
  })

  it('unique leaves a plural provider population unresolved when no singular consumer needs it', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'unique'
    autowire.addExclude('/Consumer.ts')

    await autowire.process()
    await container.compile()

    assert.isTrue(container.hasDefinition(firstStrategy))
    assert.isTrue(container.hasDefinition(secondStrategy))
    assert.isFalse(container.hasAlias(strategyAlias))
  })

  it('unique-or-fail rejects a singular request when multiple implementations remain', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'unique-or-fail'

    await autowire.process()

    let thrown
    try {
      await container.compile()
    } catch (error) {
      thrown = error
    }

    assert.instanceOf(thrown, AmbiguousAutowireException)
    assert.include(thrown.message, strategyAlias)
    assert.include(thrown.message, firstStrategy)
    assert.include(thrown.message, secondStrategy)
    assert.include(thrown.message, 'explicit alias or bind')
  })

  it('unique-or-fail respects an explicit alias', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    container.setAlias(strategyAlias, firstStrategy)
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'unique-or-fail'

    await autowire.process()
    await container.compile()

    const consumer = container.get('Consumer')
    assert.strictEqual(consumer.selected(), 'first')
    assert.instanceOf(container.get(firstStrategy), FirstStrategy)
  })

  it('unique-or-fail respects an explicit bind without creating an interface alias', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    container.addBind('strategy', new Reference(secondStrategy))
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'unique-or-fail'

    await autowire.process()
    await container.compile()

    const consumer = container.get('Consumer')
    assert.strictEqual(consumer.selected(), 'second')
    assert.instanceOf(container.get(secondStrategy), SecondStrategy)
    assert.isFalse(container.hasAlias(strategyAlias))
  })

  it('none never manufactures interface aliases', async () => {
    const container = new ContainerBuilder(false, fixtureRoot())
    const autowire = new Autowire(container)
    autowire.autowireAliasResolution = 'none'
    autowire.addExclude('/Consumer.ts')
    autowire.addExclude('/Service/SecondStrategy.ts')

    await autowire.process()
    await container.compile()

    assert.isTrue(container.hasDefinition(firstStrategy))
    assert.isFalse(container.hasAlias(strategyAlias))
  })
})
