import { describe, it } from 'mocha'
import chai from 'chai'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Definition from '../../../lib/Definition'
import Reference from '../../../lib/Reference'
import TagReference from '../../../lib/TagReference'
import ParameterReference from '../../../lib/ParameterReference'
import ContainerValidator from '../../../lib/ContainerValidator'
import ContainerValidationError from '../../../lib/Exception/ContainerValidationError'

const assert = chai.assert

describe('ContainerValidator', () => {
  // ─── Check 1: Missing dependencies ────────────────────────────────────────

  describe('missing_dependency', () => {
    it('reports ERROR when a non-nullable reference points to an undefined service', () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      def.args = [new Reference('smtp.transport')]
      container.setDefinition('mailer', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      assert.isFalse(result.isValid)
      assert.strictEqual(result.errors.length, 1)
      assert.strictEqual(result.errors[0].type, 'missing_dependency')
      assert.strictEqual(result.errors[0].service, 'mailer')
      assert.include(result.errors[0].detail, 'smtp.transport')
    })

    it('does not report ERROR for a nullable reference to an undefined service', () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      def.args = [new Reference('optional.service', true)]
      container.setDefinition('mailer', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      assert.isTrue(result.isValid)
      assert.strictEqual(result.errors.length, 0)
    })

    it('does not report ERROR when the referenced service exists', () => {
      const container = new ContainerBuilder()

      const transport = new Definition()
      container.setDefinition('smtp.transport', transport)

      const def = new Definition()
      def.args = [new Reference('smtp.transport')]
      container.setDefinition('mailer', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const missingErrors = result.errors.filter(e => e.type === 'missing_dependency')
      assert.strictEqual(missingErrors.length, 0)
    })

    it('does not report ERROR for an alias reference that exists', () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      container.setDefinition('real.service', def)
      container.setAlias('alias.service', 'real.service')

      const mailerDef = new Definition()
      mailerDef.args = [new Reference('alias.service')]
      container.setDefinition('mailer', mailerDef)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const missingErrors = result.errors.filter(e => e.type === 'missing_dependency')
      assert.strictEqual(missingErrors.length, 0)
    })
  })

  // ─── Check 2: Circular dependencies ───────────────────────────────────────

  describe('circular_dependency', () => {
    it('reports ERROR for a direct A → B → A cycle', () => {
      const container = new ContainerBuilder()

      const defA = new Definition()
      defA.args = [new Reference('b')]
      container.setDefinition('a', defA)

      const defB = new Definition()
      defB.args = [new Reference('a')]
      container.setDefinition('b', defB)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const circularErrors = result.errors.filter(e => e.type === 'circular_dependency')
      assert.isAtLeast(circularErrors.length, 1)
      assert.include(circularErrors[0].detail, 'a')
      assert.include(circularErrors[0].detail, 'b')
    })

    it('reports ERROR for a three-node cycle A → B → C → A', () => {
      const container = new ContainerBuilder()

      const defA = new Definition()
      defA.args = [new Reference('b')]
      container.setDefinition('a', defA)

      const defB = new Definition()
      defB.args = [new Reference('c')]
      container.setDefinition('b', defB)

      const defC = new Definition()
      defC.args = [new Reference('a')]
      container.setDefinition('c', defC)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const circularErrors = result.errors.filter(e => e.type === 'circular_dependency')
      assert.isAtLeast(circularErrors.length, 1)
    })

    it('does not report ERROR when there is no cycle', () => {
      const container = new ContainerBuilder()

      const defA = new Definition()
      defA.args = [new Reference('b')]
      container.setDefinition('a', defA)

      const defB = new Definition()
      container.setDefinition('b', defB)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const circularErrors = result.errors.filter(e => e.type === 'circular_dependency')
      assert.strictEqual(circularErrors.length, 0)
    })
  })

  // ─── Check 3: Unresolved parameters ───────────────────────────────────────

  describe('unresolved_parameter', () => {
    it('reports ERROR when a ParameterReference key is not defined', () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      def.args = [new ParameterReference('api.secret')]
      container.setDefinition('app.service', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const paramErrors = result.errors.filter(e => e.type === 'unresolved_parameter')
      assert.strictEqual(paramErrors.length, 1)
      assert.include(paramErrors[0].detail, 'api.secret')
    })

    it('does not report ERROR when the parameter is defined', () => {
      const container = new ContainerBuilder()

      container.setParameter('api.secret', 'my-secret')

      const def = new Definition()
      def.args = [new ParameterReference('api.secret')]
      container.setDefinition('app.service', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const paramErrors = result.errors.filter(e => e.type === 'unresolved_parameter')
      assert.strictEqual(paramErrors.length, 0)
    })
  })

  // ─── Check 4: Unused nullable fallbacks ───────────────────────────────────

  describe('unused_nullable_fallback', () => {
    it('reports WARN when a nullable reference target actually exists', () => {
      const container = new ContainerBuilder()

      const transport = new Definition()
      container.setDefinition('smtp.transport', transport)

      const def = new Definition()
      def.args = [new Reference('smtp.transport', true)]
      container.setDefinition('mailer', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const warns = result.warnings.filter(w => w.type === 'unused_nullable_fallback')
      assert.strictEqual(warns.length, 1)
      assert.strictEqual(warns[0].service, 'mailer')
    })

    it('does not report WARN when the nullable reference target does not exist', () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      def.args = [new Reference('optional.service', true)]
      container.setDefinition('mailer', def)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const warns = result.warnings.filter(w => w.type === 'unused_nullable_fallback')
      assert.strictEqual(warns.length, 0)
    })
  })

  // ─── Check 5: Deprecated services in use ──────────────────────────────────

  describe('deprecated_service_in_use', () => {
    it('reports WARN when a non-deprecated service uses a deprecated one', () => {
      const container = new ContainerBuilder()

      const oldLogger = new Definition()
      oldLogger.deprecated = 'Use new.logger instead'
      container.setDefinition('old.logger', oldLogger)

      const controller = new Definition()
      controller.args = [new Reference('old.logger')]
      container.setDefinition('app.controller', controller)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const warns = result.warnings.filter(w => w.type === 'deprecated_service_in_use')
      assert.strictEqual(warns.length, 1)
      assert.strictEqual(warns[0].service, 'app.controller')
      assert.include(warns[0].detail, 'old.logger')
    })

    it('does not report WARN when a deprecated service uses another deprecated one', () => {
      const container = new ContainerBuilder()

      const oldLogger = new Definition()
      oldLogger.deprecated = 'Use new.logger instead'
      container.setDefinition('old.logger', oldLogger)

      const alsoDeprecated = new Definition()
      alsoDeprecated.deprecated = 'Also deprecated'
      alsoDeprecated.args = [new Reference('old.logger')]
      container.setDefinition('also.deprecated', alsoDeprecated)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const warns = result.warnings.filter(w => w.type === 'deprecated_service_in_use')
      assert.strictEqual(warns.length, 0)
    })

    it('does not report WARN when no deprecated services are used', () => {
      const container = new ContainerBuilder()

      const logger = new Definition()
      container.setDefinition('logger', logger)

      const controller = new Definition()
      controller.args = [new Reference('logger')]
      container.setDefinition('app.controller', controller)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const warns = result.warnings.filter(w => w.type === 'deprecated_service_in_use')
      assert.strictEqual(warns.length, 0)
    })
  })

  // ─── Check 6: Orphan tagged services ──────────────────────────────────────

  describe('orphan_tagged_service', () => {
    it('reports INFO when a tag is defined but no consumer uses it', () => {
      const container = new ContainerBuilder()

      const listener = new Definition()
      listener.addTag('kernel.listener')
      container.setDefinition('my.listener', listener)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const infos = result.info.filter(i => i.type === 'orphan_tagged_service')
      assert.strictEqual(infos.length, 1)
      assert.include(infos[0].detail, 'kernel.listener')
    })

    it('does not report INFO when a TagReference consumes the tag', () => {
      const container = new ContainerBuilder()

      const listener = new Definition()
      listener.addTag('kernel.listener')
      container.setDefinition('my.listener', listener)

      const dispatcher = new Definition()
      dispatcher.args = [new TagReference('kernel.listener')]
      container.setDefinition('event.dispatcher', dispatcher)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const infos = result.info.filter(i => i.type === 'orphan_tagged_service')
      assert.strictEqual(infos.length, 0)
    })
  })

  // ─── Check 7: Keyed group with no default ─────────────────────────────────

  describe('keyed_group_no_default', () => {
    it('reports INFO when multiple services share a tag with no default', () => {
      const container = new ContainerBuilder()

      const paypal = new Definition()
      paypal.addTag('payment.gateway')
      container.setDefinition('payment.paypal', paypal)

      const stripe = new Definition()
      stripe.addTag('payment.gateway')
      container.setDefinition('payment.stripe', stripe)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const infos = result.info.filter(i => i.type === 'keyed_group_no_default')
      assert.strictEqual(infos.length, 1)
      assert.include(infos[0].detail, 'payment.gateway')
    })

    it('does not report INFO when one service in the group has default: true', () => {
      const container = new ContainerBuilder()

      const paypal = new Definition()
      paypal.addTag('payment.gateway', new Map([['default', true]]))
      container.setDefinition('payment.paypal', paypal)

      const stripe = new Definition()
      stripe.addTag('payment.gateway')
      container.setDefinition('payment.stripe', stripe)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const infos = result.info.filter(i => i.type === 'keyed_group_no_default')
      assert.strictEqual(infos.length, 0)
    })

    it('does not report INFO when only one service has the tag', () => {
      const container = new ContainerBuilder()

      const paypal = new Definition()
      paypal.addTag('payment.gateway')
      container.setDefinition('payment.paypal', paypal)

      const validator = new ContainerValidator(container)
      const result = validator.validate()

      const infos = result.info.filter(i => i.type === 'keyed_group_no_default')
      assert.strictEqual(infos.length, 0)
    })
  })

  // ─── Integration: ContainerBuilder.compile({ validate: true }) ────────────

  describe('compile() with validate option', () => {
    it('throws ContainerValidationError when errors found and throwOnError not false', async () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      def.args = [new Reference('missing.service')]
      container.setDefinition('broken', def)

      let thrown
      try {
        await container.compile({ validate: true })
      } catch (e) {
        thrown = e
      }

      assert.instanceOf(thrown, ContainerValidationError)
      assert.isFalse(thrown.result.isValid)
    })

    it('returns ValidationResult and does not throw when throwOnError is false', async () => {
      const container = new ContainerBuilder()

      const def = new Definition()
      def.args = [new Reference('missing.service')]
      container.setDefinition('broken', def)

      const result = await container.compile({ validate: true, throwOnError: false })

      assert.isFalse(result.isValid)
      assert.isAtLeast(result.errors.length, 1)
    })

    it('returns undefined when compile() is called without options', async () => {
      const container = new ContainerBuilder()
      const def = new Definition()
      def.synthetic = true
      container.setDefinition('simple', def)

      const result = await container.compile()

      assert.isUndefined(result)
    })

    it('returns ValidationResult with isValid true when no issues found', async () => {
      const container = new ContainerBuilder()
      const def = new Definition()
      def.synthetic = true
      container.setDefinition('simple', def)

      const result = await container.compile({ validate: true })

      assert.isDefined(result)
      assert.isTrue(result.isValid)
      assert.strictEqual(result.errors.length, 0)
    })
  })
})
