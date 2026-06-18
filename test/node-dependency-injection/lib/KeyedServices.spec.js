import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Definition from '../../../lib/Definition'
import KeyedReference from '../../../lib/KeyedReference'
import KeyedGroupReference from '../../../lib/KeyedGroupReference'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'
import path from 'path'
import StripePayment from '../../Resources/StripePayment'
import PaypalPayment from '../../Resources/PaypalPayment'
import CheckoutService from '../../Resources/CheckoutService'
import PaymentRouter from '../../Resources/PaymentRouter'

const assert = chai.assert

describe('Keyed Services', () => {
  let container

  beforeEach(() => {
    container = new ContainerBuilder()
  })

  // ─── KeyedReference ───────────────────────────────────────────────────────

  describe('KeyedReference', () => {
    it('should store group and key', () => {
      const ref = new KeyedReference('payment', 'stripe')
      assert.strictEqual(ref.group, 'payment')
      assert.strictEqual(ref.key, 'stripe')
    })
  })

  // ─── KeyedGroupReference ──────────────────────────────────────────────────

  describe('KeyedGroupReference', () => {
    it('should store group', () => {
      const ref = new KeyedGroupReference('payment')
      assert.strictEqual(ref.group, 'payment')
    })
  })

  // ─── Definition keyed fields ──────────────────────────────────────────────

  describe('Definition keyed fields', () => {
    it('should have null keyed fields by default', () => {
      const def = new Definition()
      assert.isNull(def.keyedGroup)
      assert.isNull(def.keyedKey)
      assert.isFalse(def.keyedDefault)
    })

    it('should set and get keyedGroup', () => {
      const def = new Definition()
      def.keyedGroup = 'payment'
      assert.strictEqual(def.keyedGroup, 'payment')
    })

    it('should set and get keyedKey', () => {
      const def = new Definition()
      def.keyedKey = 'stripe'
      assert.strictEqual(def.keyedKey, 'stripe')
    })

    it('should set and get keyedDefault', () => {
      const def = new Definition()
      def.keyedDefault = true
      assert.isTrue(def.keyedDefault)
    })

    it('should support chaining via setDefault', () => {
      const def = new Definition()
      const result = def.setDefault(true)
      assert.isTrue(def.keyedDefault)
      assert.strictEqual(result, def)
    })
  })

  // ─── ContainerBuilder programmatic API ───────────────────────────────────

  describe('registerKeyed / getKeyed / getKeyedGroup', () => {
    it('should register a keyed service and retrieve it by key', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)

      const stripe = container.getKeyed('payment', 'stripe')

      assert.instanceOf(stripe, StripePayment)
    })

    it('should register multiple keyed services and retrieve each by key', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)
      container.registerKeyed('payment', 'paypal', PaypalPayment)

      const stripe = container.getKeyed('payment', 'stripe')
      const paypal = container.getKeyed('payment', 'paypal')

      assert.instanceOf(stripe, StripePayment)
      assert.instanceOf(paypal, PaypalPayment)
    })

    it('should resolve the default keyed service when no key is given', () => {
      container.registerKeyed('payment', 'stripe', StripePayment).setDefault(true)
      container.registerKeyed('payment', 'paypal', PaypalPayment)

      const defaultPayment = container.getKeyed('payment')

      assert.instanceOf(defaultPayment, StripePayment)
    })

    it('should use setDefault false to not mark as default', () => {
      container.registerKeyed('payment', 'stripe', StripePayment).setDefault(false)
      container.registerKeyed('payment', 'paypal', PaypalPayment).setDefault(true)

      const defaultPayment = container.getKeyed('payment')

      assert.instanceOf(defaultPayment, PaypalPayment)
    })

    it('should return all implementations as a Map via getKeyedGroup', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)
      container.registerKeyed('payment', 'paypal', PaypalPayment)

      const payments = container.getKeyedGroup('payment')

      assert.instanceOf(payments, Map)
      assert.strictEqual(payments.size, 2)
      assert.instanceOf(payments.get('stripe'), StripePayment)
      assert.instanceOf(payments.get('paypal'), PaypalPayment)
    })

    it('should set keyedGroup and keyedKey on the definition', () => {
      const def = container.registerKeyed('payment', 'stripe', StripePayment)

      assert.strictEqual(def.keyedGroup, 'payment')
      assert.strictEqual(def.keyedKey, 'stripe')
    })

    it('should auto-generate service id as group.key', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)

      assert.isTrue(container.hasDefinition('payment.stripe'))
    })

    it('should throw KeyedGroupNotFoundException for unknown group', () => {
      const func = () => container.getKeyed('unknown')

      assert.throw(func, `Keyed group 'unknown' is not registered`)
    })

    it('should throw KeyedServiceNotFoundException for unknown key', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)

      const func = () => container.getKeyed('payment', 'unknown')

      assert.throw(func, `Keyed service 'unknown' in group 'payment' is not registered`)
    })

    it('should throw KeyedGroupNoDefaultException when no default is set', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)
      container.registerKeyed('payment', 'paypal', PaypalPayment)

      const func = () => container.getKeyed('payment')

      assert.throw(func, `No default keyed service found for group 'payment'`)
    })

    it('should throw KeyedGroupNotFoundException when getKeyedGroup on unknown group', () => {
      const func = () => container.getKeyedGroup('unknown')

      assert.throw(func, `Keyed group 'unknown' is not registered`)
    })

    it('should share instances (singleton behaviour)', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)

      const stripe1 = container.getKeyed('payment', 'stripe')
      const stripe2 = container.getKeyed('payment', 'stripe')

      assert.strictEqual(stripe1, stripe2)
    })
  })

  // ─── Injection via KeyedReference and KeyedGroupReference ─────────────────

  describe('injection via KeyedReference / KeyedGroupReference', () => {
    it('should inject a specific keyed service via KeyedReference', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)
      container.register('checkout', CheckoutService)
        .addArgument(new KeyedReference('payment', 'stripe'))

      const checkout = container.get('checkout')

      assert.instanceOf(checkout, CheckoutService)
      assert.instanceOf(checkout.payment, StripePayment)
    })

    it('should inject the full group as a Map via KeyedGroupReference', () => {
      container.registerKeyed('payment', 'stripe', StripePayment)
      container.registerKeyed('payment', 'paypal', PaypalPayment)
      container.register('payment.router', PaymentRouter)
        .addArgument(new KeyedGroupReference('payment'))

      const router = container.get('payment.router')

      assert.instanceOf(router, PaymentRouter)
      assert.instanceOf(router.payments, Map)
      assert.instanceOf(router.payments.get('stripe'), StripePayment)
      assert.instanceOf(router.payments.get('paypal'), PaypalPayment)
    })
  })

  // ─── YAML loading ─────────────────────────────────────────────────────────

  describe('YAML loading', () => {
    let loader

    beforeEach(() => {
      loader = new YamlFileLoader(container)
    })

    it('should parse keyed: section and register in group', async () => {
      await loader.load(path.join(__dirname,
        '/../../Resources/config/keyed-services.yml'))

      const stripe = container.getKeyed('payment', 'stripe')
      const paypal = container.getKeyed('payment', 'paypal')

      assert.instanceOf(stripe, StripePayment)
      assert.instanceOf(paypal, PaypalPayment)
    })

    it('should resolve the default keyed service from YAML config', async () => {
      await loader.load(path.join(__dirname,
        '/../../Resources/config/keyed-services.yml'))

      const defaultPayment = container.getKeyed('payment')

      assert.instanceOf(defaultPayment, StripePayment)
    })

    it('should inject @keyed(group, key) argument from YAML', async () => {
      await loader.load(path.join(__dirname,
        '/../../Resources/config/keyed-services.yml'))

      const checkout = container.get('checkout')

      assert.instanceOf(checkout, CheckoutService)
      assert.instanceOf(checkout.payment, StripePayment)
    })

    it('should inject @keyed_group(group) argument from YAML as Map', async () => {
      await loader.load(path.join(__dirname,
        '/../../Resources/config/keyed-services.yml'))

      const router = container.get('payment.router')

      assert.instanceOf(router, PaymentRouter)
      assert.instanceOf(router.payments, Map)
      assert.instanceOf(router.payments.get('stripe'), StripePayment)
      assert.instanceOf(router.payments.get('paypal'), PaypalPayment)
    })

    it('should set keyedDefault on the definition from YAML', async () => {
      await loader.load(path.join(__dirname,
        '/../../Resources/config/keyed-services.yml'))

      const stripeDef = container.getDefinition('payment.stripe')
      const paypalDef = container.getDefinition('payment.paypal')

      assert.isTrue(stripeDef.keyedDefault)
      assert.isFalse(paypalDef.keyedDefault)
    })
  })
})
