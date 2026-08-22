import { describe, it } from 'mocha'
import chai from 'chai'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Definition from '../../../lib/Definition'
import ContainerValidator from '../../../lib/ContainerValidator'
import ContainerValidationError from '../../../lib/Exception/ContainerValidationError'

const assert = chai.assert

describe('ContainerValidator alias integrity', () => {
  it('reports an alias whose target is not registered', () => {
    const container = new ContainerBuilder()
    container.setAlias('app.service', 'missing.service')

    const result = new ContainerValidator(container).validate()
    const errors = result.errors.filter(error => error.type === 'invalid_alias')

    assert.strictEqual(errors.length, 1)
    assert.strictEqual(errors[0].service, 'app.service')
    assert.include(errors[0].detail, 'missing.service')
  })

  it('accepts an alias whose target is a registered definition', () => {
    const container = new ContainerBuilder()
    container.setDefinition('real.service', new Definition())
    container.setAlias('app.service', 'real.service')

    const result = new ContainerValidator(container).validate()
    const errors = result.errors.filter(error => error.type === 'invalid_alias')

    assert.strictEqual(errors.length, 0)
  })

  it('does not proactively reject an unused invalid alias when validation is disabled', async () => {
    const container = new ContainerBuilder()
    container.setAlias('app.service', 'missing.service')

    await container.compile()

    assert.isTrue(container.hasAlias('app.service'))
  })

  it('rejects an invalid alias through compile validation', async () => {
    const container = new ContainerBuilder()
    container.setAlias('app.service', 'missing.service')

    let thrown
    try {
      await container.compile({ validate: true })
    } catch (error) {
      thrown = error
    }

    assert.instanceOf(thrown, ContainerValidationError)
    const errors = thrown.result.errors.filter(error => error.type === 'invalid_alias')
    assert.strictEqual(errors.length, 1)
    assert.strictEqual(errors[0].service, 'app.service')
  })

  it('treats an alias-to-alias chain as invalid when runtime cannot resolve the first hop to a definition', () => {
    const container = new ContainerBuilder()
    container.setDefinition('real.service', new Definition())
    container.setAlias('inner.alias', 'real.service')
    container.setAlias('outer.alias', 'inner.alias')

    const result = new ContainerValidator(container).validate()
    const errors = result.errors.filter(error => error.type === 'invalid_alias')

    assert.strictEqual(errors.length, 1)
    assert.strictEqual(errors[0].service, 'outer.alias')
  })
})
