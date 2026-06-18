import { describe, it, beforeEach, afterEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Condition from '../../../lib/Condition'
import path from 'path'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'

const assert = chai.assert

describe('Condition', () => {
  let container

  beforeEach(() => {
    container = new ContainerBuilder()
  })

  // ─── Static factories ───────────────────────────────────────────────────────

  describe('envExists', () => {
    it('should return a Condition with type env_exists', () => {
      const cond = Condition.envExists('NODE_ENV')
      assert.instanceOf(cond, Condition)
      assert.equal(cond.type, 'env_exists')
      assert.equal(cond.options.var, 'NODE_ENV')
    })

    it('should evaluate to true when env var exists', () => {
      const cond = Condition.envExists('NODE_ENV')
      assert.isTrue(cond.evaluate())
    })

    it('should evaluate to false when env var does not exist', () => {
      const cond = Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__')
      assert.isFalse(cond.evaluate())
    })
  })

  describe('envEquals', () => {
    it('should return a Condition with type env_equals', () => {
      const cond = Condition.envEquals('NODE_ENV', 'test')
      assert.instanceOf(cond, Condition)
      assert.equal(cond.type, 'env_equals')
      assert.equal(cond.options.var, 'NODE_ENV')
      assert.equal(cond.options.value, 'test')
    })

    it('should evaluate to true when env var equals specified value', () => {
      const cond = Condition.envEquals('NODE_ENV', 'test')
      assert.isTrue(cond.evaluate())
    })

    it('should evaluate to false when env var does not equal specified value', () => {
      const cond = Condition.envEquals('NODE_ENV', 'production')
      assert.isFalse(cond.evaluate())
    })
  })

  describe('custom', () => {
    it('should return a Condition with type custom', () => {
      const fn = () => true
      const cond = Condition.custom(fn)
      assert.instanceOf(cond, Condition)
      assert.equal(cond.type, 'custom')
    })

    it('should evaluate to true when custom fn returns truthy', () => {
      const cond = Condition.custom(() => true)
      assert.isTrue(cond.evaluate())
    })

    it('should evaluate to false when custom fn returns falsy', () => {
      const cond = Condition.custom(() => false)
      assert.isFalse(cond.evaluate())
    })
  })

  describe('all', () => {
    it('should return a Condition with type all', () => {
      const cond = Condition.all(Condition.custom(() => true), Condition.custom(() => true))
      assert.instanceOf(cond, Condition)
      assert.equal(cond.type, 'all')
    })

    it('should evaluate to true when all sub-conditions pass', () => {
      const cond = Condition.all(
        Condition.custom(() => true),
        Condition.envExists('NODE_ENV')
      )
      assert.isTrue(cond.evaluate())
    })

    it('should evaluate to false when any sub-condition fails', () => {
      const cond = Condition.all(
        Condition.custom(() => true),
        Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__')
      )
      assert.isFalse(cond.evaluate())
    })
  })

  describe('any', () => {
    it('should return a Condition with type any', () => {
      const cond = Condition.any(Condition.custom(() => true), Condition.custom(() => false))
      assert.instanceOf(cond, Condition)
      assert.equal(cond.type, 'any')
    })

    it('should evaluate to true when at least one sub-condition passes', () => {
      const cond = Condition.any(
        Condition.custom(() => false),
        Condition.envExists('NODE_ENV')
      )
      assert.isTrue(cond.evaluate())
    })

    it('should evaluate to false when all sub-conditions fail', () => {
      const cond = Condition.any(
        Condition.custom(() => false),
        Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__')
      )
      assert.isFalse(cond.evaluate())
    })
  })

  describe('missing / serviceExists (phase two)', () => {
    it('should evaluate missing to true when id is not in remaining set', () => {
      const cond = new Condition('missing', { id: 'cache.redis' })
      const remaining = new Set(['cache.memory'])
      assert.isTrue(cond.evaluatePhaseTwo(remaining))
    })

    it('should evaluate missing to false when id IS in remaining set', () => {
      const cond = new Condition('missing', { id: 'cache.redis' })
      const remaining = new Set(['cache.redis', 'cache.memory'])
      assert.isFalse(cond.evaluatePhaseTwo(remaining))
    })

    it('should evaluate service_exists to true when id IS in remaining set', () => {
      const cond = new Condition('service_exists', { id: 'http.server' })
      const remaining = new Set(['http.server'])
      assert.isTrue(cond.evaluatePhaseTwo(remaining))
    })

    it('should evaluate service_exists to false when id is not in remaining set', () => {
      const cond = new Condition('service_exists', { id: 'http.server' })
      const remaining = new Set(['cache.memory'])
      assert.isFalse(cond.evaluatePhaseTwo(remaining))
    })
  })

  // ─── isPhaseOne / isPhaseTwo ────────────────────────────────────────────────

  describe('isPhaseOne / isPhaseTwo', () => {
    it('should identify env_exists as phase one', () => {
      assert.isTrue(Condition.envExists('X').isPhaseOne())
      assert.isFalse(Condition.envExists('X').isPhaseTwo())
    })

    it('should identify env_equals as phase one', () => {
      assert.isTrue(Condition.envEquals('X', 'y').isPhaseOne())
    })

    it('should identify custom as phase one', () => {
      assert.isTrue(Condition.custom(() => true).isPhaseOne())
    })

    it('should identify all as phase one', () => {
      assert.isTrue(Condition.all(Condition.custom(() => true)).isPhaseOne())
    })

    it('should identify any as phase one', () => {
      assert.isTrue(Condition.any(Condition.custom(() => true)).isPhaseOne())
    })

    it('should identify missing as phase two', () => {
      assert.isTrue(Condition.missing('x').isPhaseTwo())
      assert.isFalse(Condition.missing('x').isPhaseOne())
    })

    it('should identify serviceExists as phase two', () => {
      assert.isTrue(Condition.serviceExists('x').isPhaseTwo())
    })
  })

  // ─── Definition integration ──────────────────────────────────────────────────

  describe('Definition.setCondition', () => {
    it('should set a condition on a definition and return the definition', () => {
      const cond = Condition.envExists('NODE_ENV')
      const definition = container.register('foo', class Foo {})
      const returned = definition.setCondition(cond)
      assert.strictEqual(returned, definition)
      assert.strictEqual(definition.condition, cond)
    })

    it('should have null condition by default', () => {
      const definition = container.register('foo', class Foo {})
      assert.isNull(definition.condition)
    })
  })

  describe('Definition.whenMissing', () => {
    it('should set whenMissingId and return the definition', () => {
      const definition = container.register('foo', class Foo {})
      const returned = definition.whenMissing('bar')
      assert.strictEqual(returned, definition)
      assert.equal(definition.whenMissingId, 'bar')
    })

    it('should have null whenMissingId by default', () => {
      const definition = container.register('foo', class Foo {})
      assert.isNull(definition.whenMissingId)
    })
  })

  describe('Definition.whenServiceExists', () => {
    it('should set whenServiceExistsId and return the definition', () => {
      const definition = container.register('foo', class Foo {})
      const returned = definition.whenServiceExists('bar')
      assert.strictEqual(returned, definition)
      assert.equal(definition.whenServiceExistsId, 'bar')
    })

    it('should have null whenServiceExistsId by default', () => {
      const definition = container.register('foo', class Foo {})
      assert.isNull(definition.whenServiceExistsId)
    })
  })

  // ─── Compile-time evaluation ─────────────────────────────────────────────────

  describe('compile: phase-one conditions', () => {
    it('should keep a service whose condition passes', async () => {
      container.register('logger', class Logger {})
        .setCondition(Condition.envExists('NODE_ENV'))

      await container.compile()

      assert.isTrue(container.hasDefinition('logger'))
    })

    it('should remove a service whose condition fails', async () => {
      container.register('redis', class Redis {})
        .setCondition(Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__'))

      await container.compile()

      assert.isFalse(container.hasDefinition('redis'))
    })

    it('should keep service when envEquals condition passes', async () => {
      container.register('debug.logger', class DebugLogger {})
        .setCondition(Condition.envEquals('NODE_ENV', 'test'))

      await container.compile()

      assert.isTrue(container.hasDefinition('debug.logger'))
    })

    it('should remove service when envEquals condition fails', async () => {
      container.register('prod.service', class ProdService {})
        .setCondition(Condition.envEquals('NODE_ENV', 'production'))

      await container.compile()

      assert.isFalse(container.hasDefinition('prod.service'))
    })

    it('should keep service when custom condition returns true', async () => {
      container.register('feature.x', class FeatureX {})
        .setCondition(Condition.custom(() => true))

      await container.compile()

      assert.isTrue(container.hasDefinition('feature.x'))
    })

    it('should remove service when custom condition returns false', async () => {
      container.register('feature.y', class FeatureY {})
        .setCondition(Condition.custom(() => false))

      await container.compile()

      assert.isFalse(container.hasDefinition('feature.y'))
    })

    it('should keep service when Condition.all passes', async () => {
      container.register('svc', class Svc {})
        .setCondition(Condition.all(
          Condition.envExists('NODE_ENV'),
          Condition.custom(() => true)
        ))

      await container.compile()

      assert.isTrue(container.hasDefinition('svc'))
    })

    it('should remove service when Condition.all has a failing sub-condition', async () => {
      container.register('svc', class Svc {})
        .setCondition(Condition.all(
          Condition.envExists('NODE_ENV'),
          Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__')
        ))

      await container.compile()

      assert.isFalse(container.hasDefinition('svc'))
    })

    it('should keep service when Condition.any has at least one passing sub-condition', async () => {
      container.register('svc', class Svc {})
        .setCondition(Condition.any(
          Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__'),
          Condition.envExists('NODE_ENV')
        ))

      await container.compile()

      assert.isTrue(container.hasDefinition('svc'))
    })

    it('should remove service when Condition.any has all failing sub-conditions', async () => {
      container.register('svc', class Svc {})
        .setCondition(Condition.any(
          Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__'),
          Condition.custom(() => false)
        ))

      await container.compile()

      assert.isFalse(container.hasDefinition('svc'))
    })
  })

  describe('compile: phase-two conditions (whenMissing)', () => {
    it('should keep fallback service when primary is missing', async () => {
      container.register('cache.memory', class InMemoryCache {})
        .whenMissing('cache.redis')

      await container.compile()

      assert.isTrue(container.hasDefinition('cache.memory'))
    })

    it('should remove fallback service when primary is present', async () => {
      container.register('cache.redis', class RedisCache {})
      container.register('cache.memory', class InMemoryCache {})
        .whenMissing('cache.redis')

      await container.compile()

      assert.isFalse(container.hasDefinition('cache.memory'))
    })

    it('should remove primary via phase-one and then keep fallback via phase-two', async () => {
      container.register('cache.redis', class RedisCache {})
        .setCondition(Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__'))
      container.register('cache.memory', class InMemoryCache {})
        .whenMissing('cache.redis')

      await container.compile()

      assert.isFalse(container.hasDefinition('cache.redis'))
      assert.isTrue(container.hasDefinition('cache.memory'))
    })
  })

  describe('compile: phase-two conditions (whenServiceExists)', () => {
    it('should keep service when dependency is present', async () => {
      container.register('http.server', class HttpServer {})
      container.register('metrics', class Metrics {})
        .whenServiceExists('http.server')

      await container.compile()

      assert.isTrue(container.hasDefinition('metrics'))
    })

    it('should remove service when dependency is absent', async () => {
      container.register('metrics', class Metrics {})
        .whenServiceExists('http.server')

      await container.compile()

      assert.isFalse(container.hasDefinition('metrics'))
    })

    it('should remove dependency via phase-one and then remove dependent via phase-two', async () => {
      container.register('http.server', class HttpServer {})
        .setCondition(Condition.envExists('__THIS_VAR_SHOULD_NEVER_EXIST__'))
      container.register('metrics', class Metrics {})
        .whenServiceExists('http.server')

      await container.compile()

      assert.isFalse(container.hasDefinition('http.server'))
      assert.isFalse(container.hasDefinition('metrics'))
    })
  })

  // ─── YAML loader ─────────────────────────────────────────────────────────────

  describe('YamlFileLoader: when: conditions', () => {
    it('should apply env_exists condition from YAML', async () => {
      const loader = new YamlFileLoader(container)
      await loader.load(
        path.join(__dirname, '../../Resources/config/conditional-services.yml')
      )

      // env.exists.passes uses NODE_ENV which is set in test env
      assert.isNotNull(container.getDefinition('env.exists.passes').condition)
      assert.equal(container.getDefinition('env.exists.passes').condition.type, 'env_exists')

      // env.exists.fails uses a var that doesn't exist
      assert.isNotNull(container.getDefinition('env.exists.fails').condition)
      assert.equal(container.getDefinition('env.exists.fails').condition.type, 'env_exists')
    })

    it('should apply env_equals condition from YAML', async () => {
      const loader = new YamlFileLoader(container)
      await loader.load(
        path.join(__dirname, '../../Resources/config/conditional-services.yml')
      )

      const def = container.getDefinition('env.equals.passes')
      assert.isNotNull(def.condition)
      assert.equal(def.condition.type, 'env_equals')
      assert.equal(def.condition.options.var, 'NODE_ENV')
      assert.equal(def.condition.options.value, 'test')
    })

    it('should apply missing condition from YAML', async () => {
      const loader = new YamlFileLoader(container)
      await loader.load(
        path.join(__dirname, '../../Resources/config/conditional-services.yml')
      )

      const def = container.getDefinition('fallback.cache')
      assert.equal(def.whenMissingId, 'primary.cache')
    })

    it('should apply service_exists condition from YAML', async () => {
      const loader = new YamlFileLoader(container)
      await loader.load(
        path.join(__dirname, '../../Resources/config/conditional-services.yml')
      )

      const def = container.getDefinition('needs.primary.cache')
      assert.equal(def.whenServiceExistsId, 'primary.cache')
    })

    it('should evaluate conditions correctly when compiling after YAML load', async () => {
      const loader = new YamlFileLoader(container)
      await loader.load(
        path.join(__dirname, '../../Resources/config/conditional-services.yml')
      )

      await container.compile()

      // always.present has no condition → always kept
      assert.isTrue(container.hasDefinition('always.present'))

      // NODE_ENV is set in the test environment → passes
      assert.isTrue(container.hasDefinition('env.exists.passes'))

      // __THIS_VAR_SHOULD_NEVER_EXIST__ is not set → removed
      assert.isFalse(container.hasDefinition('env.exists.fails'))

      // NODE_ENV === 'test' → passes
      assert.isTrue(container.hasDefinition('env.equals.passes'))

      // NODE_ENV !== 'production' → removed
      assert.isFalse(container.hasDefinition('env.equals.fails'))

      // primary.cache is present → fallback.cache is removed (missing condition fails)
      assert.isFalse(container.hasDefinition('fallback.cache'))

      // primary.cache is present → needs.primary.cache is kept
      assert.isTrue(container.hasDefinition('needs.primary.cache'))
    })
  })
})
