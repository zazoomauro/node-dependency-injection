import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Definition from '../../../lib/Definition'
import Reference from '../../../lib/Reference'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'
import PassConfig from '../../../lib/PassConfig'
import path from 'path'
import FooManager from './../../Resources/fooManager'
import BarManager from './../../Resources/barManager'
import Sinon from 'sinon'

const assert = chai.assert

describe('ContainerBuilder', () => {
  let container
  const logger = { warn: Sinon.spy() }

  beforeEach(() => {
    container = new ContainerBuilder()
    container.logger = logger
  })

  describe('default directory', () => {
    it('should not load if root directory is not absolute', () => {
      // Arrange.
      const dir = 'hola/foo/src'
      
      // Act.
      const func = () => new ContainerBuilder(false, dir)

      // Assert.
      assert.throw(func, Error, 'Root directory must be absolute')
    })

    it('should not load if root directory not found', () => {
      // Arrange.
      const dir = '/hola/foo/src'

      // Act.
      const func = () => new ContainerBuilder(false, dir)

      // Assert.
      assert.throw(func, Error, 'Root directory not found')
    })

    it('should load if root directory is valid', () => {
      // Arrange.
      const dir = path.join(
        __dirname, '..', '..', 'Resources-ts', 'Autowire', 'src'
      )

      // Act.
      const container = new ContainerBuilder(false, dir)

      // Assert.
      assert.strictEqual(container.defaultDir, dir)
    })
  })

  describe('containerReferenceAsService', () => {
    it('should return containerReferenceAsService boolean properly', () => {
      // Arrange.
      const containerReferenceAsService = true
      const container = new ContainerBuilder(containerReferenceAsService)

      // Act.
      const actual = container.containerReferenceAsService

      // Assert.
      return assert.isTrue(actual)
    })
  })

  describe('logger', () => {
    it('should set and get the right logger instance implementing warn method',
      () => {
        // Arrange.
        const logger = { warn: () => {} }

        // Act.
        container.logger = logger

        // Assert.
        return assert.strictEqual(container.logger, logger)
      })

    it(
      'should throw an exception if the logger instance not implements warn method',
      () => {
        // Arrange.
        const logger = {}

        // Act.
        const actual = () => { container.logger = logger }

        // Assert.
        assert.throw(actual, Error,
          'The logger instance does not implements the warn method')
      })
  })

  describe('register', () => {
    it('should return a definition instance', () => {
      // Arrange.
      const id = 'foo'
      const className = 'bar'

      // Act.
      const actual = container.register(id, className)

      // Assert.
      return assert.instanceOf(actual, Definition)
    })

    it(
      'should return a synthetic definition if do not send the second argument',
      () => {
        // Arrange.
        const id = 'synthetic.foo'

        // Act.
        const actual = container.register(id)

        // Assert.
        assert.isTrue(actual.synthetic)

        return assert.instanceOf(actual, Definition)
      })
  })

  describe('get', () => {
    it('should not retrieve instance from a boolean id', () => {
      // Arrange.
      const id = true

      // Act.
      const actual = () => container.get(id)

      // Assert.
      assert.throw(actual, Error, `Unable to retrieve instance from id with type boolean.`)
    })

    it('should not retrieve instance from a number id', () => {
      // Arrange.
      const id = 91238

      // Act.
      const actual = () => container.get(id)

      // Assert.
      assert.throw(actual, Error, `Unable to retrieve instance from id with type number.`)
    })

    it('should retrieve instance service from a class type', () => {
      // Arrange.
      const id = 'some_service'
      class Foo {}
      container.register(id, Foo)

      // Act.
      const actual = container.get(Foo)

      // Assert.
      assert.instanceOf(actual, Foo)
    })

    it('should not retrieve instance service from a class type if not registered', () => {
      // Arrange.
      class Foo { }

      // Act.
      const actual = () => container.get(Foo)

      // Assert.
      assert.throw(actual, Error, `The service Foo is not registered`)
      assert.isTrue(logger.warn.calledWith(`The service Foo is not registered`))
    })
    
    it('should retrieve the same instance if is a shared definition',
      () => {
        // Arrange.
        const id = 'not.shared'

        class Foo {}

        const definition = new Definition(Foo)
        container.setDefinition(id, definition)

        // Act.
        const actual = container.get(id)
        const expected = container.get(id)

        // Assert.
        return assert.strictEqual(actual, expected)
      })

    it('should retrieve a different instance if is not a shared definition',
      () => {
        // Arrange.
        const id = 'not_shared'

        class Foo {}

        const definition = new Definition(Foo)
        definition.shared = false
        container.setDefinition(id, definition)

        // Act.
        const actual = container.get(id)
        const expected = container.get(id)

        // Assert.
        return assert.notStrictEqual(actual, expected)
      })

    it('should get a decorated service properly', async () => {
      // Arrange.
      class Foo {}

      class DecoratingFoo {}

      container.register('foo', Foo)
      const decoratingDefinition = container.register('decorating.foo',
        DecoratingFoo)
      decoratingDefinition.decoratedService = 'foo'

      // Act.
      await container.compile()
      const actual = container.get('foo')

      // Assert.
      assert.instanceOf(actual, DecoratingFoo)
    })

    it('should get the inner service from a decorated service', async () => {
      // Arrange.
      class Foo {}

      class DecoratingFoo {}

      container.register('foo', Foo)
      const decoratingDefinition = container.register('decorating.foo',
        DecoratingFoo)
      decoratingDefinition.decoratedService = 'foo'

      // Act.
      await container.compile()
      const actual = container.get('decorating.foo.inner')

      // Assert.
      assert.instanceOf(actual, Foo)
    })

    it('should inject the inner service to the decorated service', async () => {
      // Arrange.
      class Foo {}

      class DecoratingFoo {
        constructor (inner) {
          this._inner = inner
        }

        get inner () {
          return this._inner
        }
      }

      container.register('foo', Foo)
      const decoratingDefinition = container.register('decorating.foo',
        DecoratingFoo)
      decoratingDefinition.decoratedService = 'foo'
      decoratingDefinition.args = [new Reference('decorating.foo.inner')]

      // Act.
      await container.compile()
      const actual = container.get('foo')

      // Assert.
      assert.instanceOf(actual.inner, Foo)
    })

    it('should inject the inner service to the decorated service with ' +
      'decoration priority', async () => {
      // Arrange.
      const expected = 'decoration_priority'

      class Foo {
        get inner () {
          return false
        }
      }

      class Baz {
        get inner () {
          return false
        }
      }

      class Bar {
        get inner () {
          return expected
        }
      }

      container.register('foo', Foo)

      const definitionBar = container.register('bar', Bar)
      definitionBar.addArgument(new Reference('bar.inner'))
      definitionBar.public = false
      definitionBar.decoratedService = 'foo'
      definitionBar.decorationPriority = 5

      const definitionBaz = container.register('baz', Baz)
      definitionBaz.addArgument(new Reference('baz.inner'))
      definitionBaz.public = false
      definitionBaz.decoratedService = 'foo'
      definitionBaz.decorationPriority = 1

      // Act.
      await container.compile()
      const actual = container.get('foo')

      // Assert.
      assert.strictEqual(actual.inner, expected)
    })

    it(
      'should not get an synthetic instance cos the definition does not exists',
      () => {
        // Arrange.
        const syntheticServiceName = 'foo'

        class SyntheticService {}

        container.set(syntheticServiceName, new SyntheticService())

        // Act.
        const actual = () => container.get(syntheticServiceName)

        // Assert.
        assert.throw(actual, Error,
          `The service ${syntheticServiceName} is not registered`)
        assert.isTrue(logger.warn.calledWith(`The service ${syntheticServiceName} is not registered`))
      })

    it(
      'should not get an synthetic instance cos the definition is not synthetic',
      () => {
        // Arrange.
        const syntheticServiceName = 'foo'
        const definition = new Definition()
        definition.synthetic = false
        container.setDefinition(syntheticServiceName, definition)

        class SyntheticService {}

        container.set(syntheticServiceName, new SyntheticService())

        // Act.
        const actual = () => container.get(syntheticServiceName)

        // Assert.
        assert.throw(actual, Error,
          `The service ${syntheticServiceName} is not registered`)
        assert.isTrue(logger.warn.calledWith(`The service ${syntheticServiceName} is not registered`))
      })

    it('should return the instance with a factory definition', () => {
      // Arrange.
      class Foo {
        static getFactory () {
          return new Bar()
        }
      }

      class Bar {}

      const method = 'getFactory'
      const id = 'foo.service'
      const definition = new Definition()
      definition.setFactory(Foo, method)
      container.setDefinition(id, definition)

      // Act.
      const actual = container.get(id)

      // Assert.
      assert.instanceOf(actual, Bar)
    })

    it('should return the instance with a factory definition and arguments',
      () => {
        // Arrange.
        class Foo {
          static getFactory (value = false) {
            if (value) {
              return new Bar()
            }

            return false
          }
        }

        class Bar {}

        const method = 'getFactory'
        const id = 'foo.service'
        const definition = new Definition()
        definition.args = [true]
        definition.setFactory(Foo, method)
        container.setDefinition(id, definition)

        // Act.
        const actual = container.get(id)

        // Assert.
        assert.instanceOf(actual, Bar)
      })

    it('should return the instance with a reference factory definition', () => {
      // Arrange.
      class Foo {
        static getFactory () {
          return new Bar()
        }
      }

      class Bar {}

      const method = 'getFactory'
      const id = 'foo.service'
      const factoryId = 'factory.service'
      container.register(factoryId, Foo)
      const definition = new Definition()
      definition.setFactory(new Reference(factoryId), method)
      container.setDefinition(id, definition)

      // Act.
      const actual = container.get(id)

      // Assert.
      assert.instanceOf(actual, Bar)
    })

    it(
      'should return the instance with a reference factory definition and arguments',
      () => {
        // Arrange.
        class Foo {
          static getFactory (value = 'ko') {
            if (value === 'ok') {
              return new Bar()
            }

            return null
          }
        }

        class Bar {}

        const method = 'getFactory'
        const id = 'foo.service'
        const factoryId = 'factory.service'
        container.register(factoryId, Foo)
        const definition = new Definition()
        definition.args = ['ok']
        definition.setFactory(new Reference(factoryId), method)
        container.setDefinition(id, definition)

        // Act.
        const actual = container.get(id)

        // Assert.
        assert.instanceOf(actual, Bar)
      })

    it('should throw an exception if the service not exists', () => {
      // Arrange.
      const id = 'service._foo_bar'

      // Act.
      const actual = () => container.get(id)

      // Assert.
      assert.throw(actual, Error, `The service ${id} is not registered`)
      assert.isTrue(logger.warn.calledWith(`The service ${id} is not registered`))
    })

    it('should return the right service', () => {
      // Arrange.
      const id = 'service.foo'

      class Foo {
      }

      container.register(id, Foo)

      // Act.
      const actual = container.get(id)

      // Assert.
      return assert.instanceOf(actual, Foo)
    })

    it('should return the right service with argument in the constructor',
      () => {
        // Arrange.
        const id = 'service.foo'
        const param = 'foo bar'

        class Foo {
          constructor (param) {
            this._param = param
          }

          get param () {
            return this._param
          }
        }

        container.register(id, Foo).addArgument(param)

        // Act.
        const actual = container.get(id)

        // Assert.
        return assert.strictEqual(actual.param, param)
      })

    it('should return the right service with reference argument', () => {
      // Arrange.
      const id = 'service.foo'
      const referenceId = 'service.bar'

      class Bar {
      }

      class Foo {
        constructor (bar) {
          this._bar = bar
        }

        get bar () {
          return this._bar
        }
      }

      container.register(referenceId, Bar)
      container.register(id, Foo).addArgument(new Reference(referenceId))

      // Act.
      const actual = container.get(id)

      // Assert.
      return assert.instanceOf(actual.bar, Bar)
    })

    it('should return the right service with reference argument', () => {
      // Arrange.
      const id = 'service.foo'
      const referenceId = 'service.bar'

      class Bar {
      }

      class Foo {
        constructor (bar = null) {
          this._bar = bar
        }

        get bar () {
          return this._bar
        }
      }

      container.register(referenceId, Bar)
      container.register(id, Foo).addArgument(new Reference(referenceId, true))

      // Act.
      const actual = container.get(id)

      // Assert.
      assert.instanceOf(actual.bar, Bar)

      return assert.instanceOf(actual, Foo)
    })

    it('should return the right service with reference argument nullable',
      () => {
        // Arrange.
        const id = 'service.foo'
        const referenceId = 'service.bar'

        class Foo {
          constructor (bar = null) {
            this._bar = bar
          }

          get bar () {
            return this._bar
          }
        }

        container.register(id, Foo)
          .addArgument(new Reference(referenceId, true))

        // Act.
        const actual = container.get(id)

        // Assert.
        assert.isNull(actual.bar)

        return assert.instanceOf(actual, Foo)
      })

    it('should return the right service with reference argument', () => {
      // Arrange.
      const id = 'service.foo'
      const reference1Id = 'service.bar'
      const reference2Id = 'service.foo_bar'

      class FooBar {
      }

      class Bar {
        constructor (fooBar) {
          this._fooBar = fooBar
        }

        get fooBar () {
          return this._fooBar
        }
      }

      class Foo {
        constructor (bar) {
          this._bar = bar
        }

        get bar () {
          return this._bar
        }
      }

      container.register(reference2Id, FooBar)
      container.register(reference1Id, Bar)
        .addArgument(new Reference(reference2Id))
      container.register(id, Foo).addArgument(new Reference(reference1Id))

      // Act.
      const actual = container.get(id)

      // Assert.
      assert.instanceOf(actual.bar, Bar)
      return assert.instanceOf(actual.bar.fooBar, FooBar)
    })

    it('should call the method without any argument', () => {
      // Arrange.
      const id = 'service.foo'
      const parameter = 'foobar'

      class Foo {
        bar (parameter) {
          this._parameter = parameter
        }

        get parameter () {
          return this._parameter
        }
      }

      container.register(id, Foo).addMethodCall('bar', [parameter])

      // Act.
      const foo = container.get(id)

      // Assert.
      return assert.strictEqual(foo.parameter, parameter)
    })

    it('should throw an exception if the method call does not exists', () => {
      // Arrange.
      const id = 'service.foo'
      const method = 'bar'

      class Foo {}

      container.register(id, Foo).addMethodCall(method)

      // Act.
      const actual = () => container.get(id)

      // Assert.
      return assert.throw(actual, Error, `Method ${method} not found`)
    })

    it(
      'should get the service instance and instantiate ones multiple service dependency',
      () => {
        const fooId = 'service.foo'
        const barId = 'service.bar'
        const fooBarId = 'service.foo_bar'
        let constructorCalls = 0

        class FooBar {
          constructor () {
            constructorCalls++
          }
        }

        class Bar {
          constructor (fooBar) {
            this._fooBar = fooBar
          }

          get fooBar () {
            return this._fooBar
          }
        }

        class Foo {
          constructor (fooBar) {
            this._fooBar = fooBar
          }

          get fooBar () {
            return this._fooBar
          }
        }

        container.register(fooBarId, FooBar)
        container.register(barId, Bar).addArgument(new Reference(fooBarId))
        container.register(fooId, Foo).addArgument(new Reference(fooBarId))

        // Act.
        container.get(fooId)
        container.get(barId)

        // Assert.
        return assert.strictEqual(constructorCalls, 1)
      })

    it('should return an instance with set properties', () => {
      // Arrange.
      class Foo {
        set bar (value) {
          this._bar = value
        }

        get bar () {
          return this._bar
        }
      }

      const serviceId = 'foo'
      const propertyKey = 'bar'
      const value = 'foo.bar'
      const definition = new Definition(Foo)
      definition.addProperty(propertyKey, value)
      container.setDefinition(serviceId, definition)

      // Act.
      const actual = container.get(serviceId)

      // Assert.
      return assert.strictEqual(actual.bar, value)
    })

    it('should instantiate a lazy service only when get the service', async () => {
      // Arrange.
      const fooId = 'service.foo'
      let constructorCalls = 0

      class Foo {
        constructor () {
          constructorCalls++
        }
      }

      const definition = new Definition(Foo)
      definition.lazy = true
      container.setDefinition(fooId, definition)
      await container.compile()

      // Act.
      container.get(fooId)

      // Assert.
      return assert.strictEqual(constructorCalls, 1)
    })

    it('should throw an exception if we get a private service', () => {
      // Arrange.
      const fooId = 'service.foo'

      class Foo {}

      const definition = new Definition(Foo)
      definition.public = false
      container.setDefinition(fooId, definition)

      // Act.
      const actual = () => container.get(fooId)

      // Assert.
      return assert.throw(actual, Error, `The service ${fooId} is private`)
    })

    it('should return container instance if ContainerBuilder constructor ' +
      'param is true', () => {
      // Arrange.
      const container = new ContainerBuilder(true)

      // Act.
      const actual = container.get('service_container')

      // Assert.
      return assert.strictEqual(container, actual)
    })

    it('should throw a service not found exception if param constructor ' +
      'is not provided', () => {
      // Arrange not needed.

      // Act.
      const actual = () => container.get('service_container')

      // Assert.
      assert.throw(actual, Error,
        'The service service_container is not registered')
      assert.isTrue(logger.warn.calledWith(`The service service_container is not registered`))
    })
  })

  describe('compile', () => {
    it('should not instance an abstract definition on compile', async () => {
      // Arrange.
      let expected = true

      class Foo {constructor () { expected = false }}

      const definition = new Definition(Foo)
      definition.abstract = true
      container.setDefinition('foo', definition)

      // Act.
      await container.compile()

      // Assert.
      return assert.isTrue(expected)
    })

    it(
      'should throw an ServiceCircularReferenceException instead of RangeError',
      async () => {
        // Arrange.
        container.register('service.a', class A {})
          .addArgument(new Reference('service.b'))
        container.register('service.b', class B {})
          .addArgument(new Reference('service.a'))

        // Act.
        const actual = container.compile()

        // Assert.
        assert.isRejected(actual, 'Circular reference detected')
      })

    it('should call the process method by priority properly',
      async () => {
        // Arrange.
        const fooId = 'service.foo'

        class Foo {}

        container.register(fooId, Foo)
        const valueFirstPass = 'foo'
        const valueSecondPass = 'bar'
        const expected = []

        class FirstPass {process () { expected.push(valueFirstPass) }}

        class SecondPass {process () { expected.push(valueSecondPass) }}

        container.addCompilerPass(new SecondPass(),
          PassConfig.TYPE_AFTER_REMOVING, 21)
        container.addCompilerPass(new FirstPass(),
          PassConfig.TYPE_AFTER_REMOVING, 17)

        // Act.
        await container.compile()

        // Assert.
        assert.strictEqual(expected[0], valueFirstPass)

        return assert.strictEqual(expected[1], valueSecondPass)
      })

    it('should add more compiler pass by priority',
      async () => {
        // Arrange.
        const fooId = 'service.foo'

        class Foo {}

        container.register(fooId, Foo)

        class FirstPass {process () {}}

        class SecondPass {process () {}}

        container.addCompilerPass(new FirstPass(),
          PassConfig.TYPE_AFTER_REMOVING, 1)
        container.addCompilerPass(new SecondPass(),
          PassConfig.TYPE_AFTER_REMOVING, 2)

        // Act.
        await container.compile()

        // Assert.
        return assert.instanceOf(container.get(fooId), Foo)
      })

    it('should remove private instances if no remove pass config passed',
      async () => {
        // Arrange.
        const fooId = 'service.foo'

        class Foo {}

        const definition = new Definition(Foo)
        definition.public = false
        container.setDefinition(fooId, definition)

        // Act.
        await container.compile()

        // Assert.
        return assert.isUndefined(container._container.get(fooId))
      })

    it('should not remove private instances if remove pass config passed',
      async () => {
        // Arrange.
        const fooId = 'service.foo'

        class Foo {}

        const definition = new Definition(Foo)
        definition.public = false
        container.setDefinition(fooId, definition)

        class FooPass {
          process () {}
        }

        container.addCompilerPass(new FooPass(), PassConfig.TYPE_REMOVE)

        // Act.
        await container.compile()

        // Assert.
        return assert.instanceOf(container._container.get(fooId), Foo)
      })

    it('should load an extension when compile', async () => {
      // Arrange.
      let extensionLoaded = false

      class FooExtension {
        load () {
          extensionLoaded = true
        }
      }

      container.registerExtension(new FooExtension())

      // Act.
      await container.compile()

      // Assert.
      assert.isTrue(extensionLoaded)
    })

    it(
      'should register an empty compiler pass with a optimize type will not freeze the container',
      async () => {
        // Arrange.
        class FooPass {
          process () {}
        }

        container.addCompilerPass(new FooPass(), PassConfig.TYPE_OPTIMIZE)

        // Act.
        await container.compile()

        // Assert.
        return assert.isFalse(container.frozen)
      })

    it('should compile the container and freeze the same container', async () => {
      // Arrange not needed.

      // Act.
      await container.compile()

      // Assert.
      return assert.isTrue(container.frozen)
    })

    it('should compile the container and return a service', async () => {
      // Arrange.
      const id = 'service.foo'
      const parameter = 'foobar'

      class Foo {
        constructor (parameter) {
          this._parameter = parameter
        }

        get parameter () {
          return this._parameter
        }
      }

      container.register(id, Foo).addArgument(parameter)

      // Act.
      await container.compile()

      // Assert.
      return assert.strictEqual(container.get(id).parameter, parameter)
    })

    it('should not register more services when the container is already frozen',
      async () => {
        // Arrange.
        container.register('foo', class Foo {})

        // Act.
        await container.compile()
        const actual = () => container.register('bar', class Bar {})

        // Assert.
        return assert.throw(actual, Error,
          'You cannot register more services when the container is frozen')
      })

    it(
      'should prevent instantiate class again if we get a service and then compile',
      async () => {
        const fooId = 'service.foo'
        let constructorCalls = 0

        class Foo {
          constructor () {
            constructorCalls++
          }
        }

        container.register(fooId, Foo)
        container.get(fooId)

        // Act.
        await container.compile()
        const foo = container.get(fooId)

        // Assert.
        assert.strictEqual(constructorCalls, 1)
        return assert.instanceOf(foo, Foo)
      })

    it('should process the registered pass process method', async () => {
      // Arrange.
      let processedPass = false
      let expectedContainer = null

      class FooPass {
        process (container) {
          processedPass = true
          expectedContainer = container
        }
      }

      container.addCompilerPass(new FooPass())

      // Act.
      await container.compile()

      // Assert.
      assert.isTrue(processedPass)
      return assert.strictEqual(container, expectedContainer)
    })

    it(
      'should not instantiate twice even if there is a compiler pass during compilation',
      async () => {
        // Arrange.
        let actualCompilations = 0

        class FooPass {
          process (container) {
            actualCompilations++
          }
        }

        container.addCompilerPass(new FooPass())

        // Act.
        await container.compile()
        await container.compile()

        // Assert.
        return assert.strictEqual(actualCompilations, 1)
      })

    it(
      'should not instantiate a service twice even if a dependency needs another service from yml loader',
      async () => {
        // Arrange.
        FooManager.prototype.fooManagerCalls = 0
        const loader = new YamlFileLoader(container)
        await loader.load(
          path.join(__dirname, '../../Resources/config/fake-services-2.yml'))

        // Act.
        await container.compile()

        // Assert.
        return assert.strictEqual(FooManager.prototype.fooManagerCalls, 1)
      })

    it(
      'should not instantiate a service twice even if a dependency needs another service from container builder',
      async () => {
        // Arrange.
        FooManager.prototype.fooManagerCalls = 0
        container.register('foo_manager', FooManager)
        container.register('bar_manager', BarManager)
          .addArgument(new Reference('foo_manager'))

        // Act.
        await container.compile()

        // Assert.
        return assert.strictEqual(FooManager.prototype.fooManagerCalls, 1)
      })

    it('should return an instance with set properties', async () => {
      // Arrange.
      class Foo {
        set bar (value) {
          this._bar = value
        }

        get bar () {
          return this._bar
        }
      }

      const serviceId = 'foo'
      const propertyKey = 'bar'
      const value = 'foo.bar'
      const definition = new Definition(Foo)
      definition.addProperty(propertyKey, value)
      container.setDefinition(serviceId, definition)

      // Act.
      await container.compile()

      // Assert.
      return assert.strictEqual(container.get(serviceId).bar, value)
    })

    it('should not instantiate a lazy service on compile', async () => {
      // Arrange.
      const fooId = 'service.foo'
      let constructorCalls = 0

      class Foo {
        constructor () {
          constructorCalls++
        }
      }

      const definition = new Definition(Foo)
      definition.lazy = true
      container.setDefinition(fooId, definition)

      // Act.
      await container.compile()

      // Assert.
      return assert.strictEqual(constructorCalls, 0)
    })
  })

  describe('addCompilerPass', () => {
    it(
      'should throw an error if the registered compiler pass do not have process method',
      () => {
        // Arrange.
        class FooPass {}

        // Act.
        const actual = () => container.addCompilerPass(new FooPass())

        // Assert.
        return assert.throw(actual, Error,
          'The compiler pass FooPass does not have the process method')
      })

    it('should register properly a compiler pass if has the process method',
      () => {
        // Arrange.
        class FooPass {
          process () {}
        }

        // Act.
        container.addCompilerPass(new FooPass())

        // Assert.
        return assert.strictEqual(
          container._compilerPass[PassConfig.TYPE_BEFORE_OPTIMIZATION].length,
          1)
      })

    it(
      'should register a compiler pass with a different compiler pass type config',
      () => {
        // Arrange.
        class FooPass {
          process () {}
        }

        // Act.
        container.addCompilerPass(new FooPass(), PassConfig.TYPE_OPTIMIZE)

        // Assert.
        return assert.strictEqual(
          container._compilerPass[PassConfig.TYPE_OPTIMIZE].length, 1)
      })

    it('should throw an exception if the pass config type is wrong', () => {
      // Arrange.
      const type = 'foo'

      class FooPass {
        process () {}
      }

      // Act.
      const actual = () => container.addCompilerPass(new FooPass(), type)

      // Assert.
      return assert.throw(actual, Error,
        `${type} is a wrong compiler pass config type`)
    })
  })

  describe('setAlias', () => {
    it('should return the same service type using aliasing', () => {
      // Arrange.
      const fooId = 'service.foo'
      const aliasId = 'foo'

      class Foo {}

      container.register(fooId, Foo)

      // Act.
      container.setAlias(aliasId, fooId)
      const actual = container.get(aliasId)

      // Assert.
      return assert.instanceOf(actual, Foo)
    })

    it('should return the same service instance using aliasing', () => {
      // Arrange.
      const fooId = 'service.foo'
      const aliasId = 'foo'

      class Foo {}

      container.register(fooId, Foo)
      container.setAlias(aliasId, fooId)
      const expected = container.get(fooId)

      // Act.
      const actual = container.get(aliasId)

      // Assert.
      return assert.strictEqual(actual, expected)
    })
  })

  describe('setDefinition', () => {
    it(
      'should throw an exception if the sent definition argument is not a Definition',
      () => {
        // Arrange.
        const definition = 'foo'

        // Act.
        const actual = () => container.setDefinition('bar', definition)

        // Assert.
        return assert.throw(actual, Error,
          'You cannot register not valid definition')
      })

    it('should register the definition properly and return the definition',
      () => {
        // Arrange.
        class Foo {}

        const definition = new Definition(Foo)
        const id = 'foo'

        // Act.
        container.setDefinition(id, definition)

        // Assert.
        return assert.instanceOf(container.get(id), Foo)
      })

    it(
      'should add the right arguments dependencies in the definition constructor',
      () => {
        // Arrange.
        class Foo {
          constructor (string) {
            this.string = string
          }
        }

        const id = 'foo'
        const stringValue = 'foo'
        const definition = new Definition(Foo, [stringValue])

        // Act.
        container.setDefinition(id, definition)
        const actual = container.get(id).string

        // Assert.
        return assert.strictEqual(actual, stringValue)
      })
  })

  describe('findTaggedServiceIds', () => {
    it('should return an array with tagged services', () => {
      // Arrange.
      class Foo {}

      const id = 'foo'
      const tag = 'fooTag'
      const definition = new Definition(Foo)
      definition.addTag(tag)
      container.setDefinition(id, definition)

      // Act.
      const actual = container.findTaggedServiceIds(tag)

      // Assert.
      return assert.lengthOf(actual, 1)
    })

    it('should return an array with multiple tagged services', () => {
      // Arrange.
      class Foo {}

      const id = 'foo'
      const fooTag = 'fooTag'
      const barTag = 'barTag'
      const definition = new Definition(Foo)
      definition.addTag(fooTag).addTag(barTag)
      container.setDefinition(id, definition)

      // Act.
      const actual = container.findTaggedServiceIds(barTag)

      // Assert.
      return assert.lengthOf(actual, 1)
    })

    it('should return a map of attributes', () => {
      // Arrange.
      const tagName = 'listener'
      const eventName = 'event'
      const eventValue = 'prePersist'
      const definition = new Definition(class Foo {})
      const attributes = new Map()
      attributes.set(eventName, eventValue)
      definition.addTag(tagName, attributes)
      container.setDefinition('app.listener', definition)

      // Act.
      const actual = container.findTaggedServiceIds(tagName)

      // Assert.
      for (const definition of actual.values()) {
        for (const tag of definition.tags) {
          assert.strictEqual(eventValue, tag.attributes.get(eventName))
        }
      }
    })
  })

  describe('setParameter', () => {
    it('should set a boolean parameter properly', () => {
      // Arrange.
      const key = 'foo.bar'
      const value = true

      // Act.
      container.setParameter(key, value)

      // Assert.
      assert.strictEqual(container._parameters.get(key), value)
    })

    it('should set a string parameter properly', () => {
      // Arrange.
      const key = 'foo.bar'
      const value = 'foobar'

      // Act.
      container.setParameter(key, value)

      // Assert.
      assert.strictEqual(container._parameters.get(key), value)
    })

    it('should set an array parameter properly', () => {
      // Arrange.
      const key = 'foo.bar'
      const value = ['foo', 'bar']

      // Act.
      container.setParameter(key, value)

      // Assert.
      assert.strictEqual(container._parameters.get(key), value)
    })

    it('should throw an exception if the set value is not a valid parameter',
      () => {
        // Arrange.
        class InvalidParameter {}

        const key = 'foo.bar'
        const value = InvalidParameter

        // Act.
        const actual = () => container.setParameter(key, value)

        // Assert.
        return assert.throw(actual, TypeError)
      })
  })

  describe('getParameter', () => {
    it('should get a parameter properly', () => {
      // Arrange.
      const key = 'foo.bar'
      const value = 'foobar'
      container.setParameter(key, value)

      // Act.
      const actual = container.getParameter(key)

      // Assert.
      assert.strictEqual(actual, value)
    })
  })

  describe('hasParameter', () => {
    it('should return true if the parameters was previously set', () => {
      // Arrange.
      const key = 'foo.bar'
      const value = 'foobar'
      container.setParameter(key, value)

      // Act.
      const actual = container.hasParameter(key)

      // Assert.
      assert.isTrue(actual)
    })

    it('should return false if the parameters was not previously set', () => {
      // Arrange not needed.

      // Act.
      const actual = container.hasParameter('foo')

      // Assert.
      assert.isFalse(actual)
    })
  })

  describe('hasDefinition', () => {
    it('should return true if the definition was properly set', () => {
      // Arrange.
      class Foo {}

      const key = 'foo'
      const definition = new Definition(Foo)
      container.setDefinition(key, definition)

      // Act.
      const actual = container.hasDefinition(key)

      // Assert.
      return assert.isTrue(actual)
    })

    it('should return false if the definition if was not properly set', () => {
      // Arrange.
      const key = 'foo'

      // Act.
      const actual = container.hasDefinition(key)

      // Assert.
      return assert.isFalse(actual)
    })

    it('should return false if we are looking for an alias definition', () => {
      // Arrange.
      class Foo {}

      const key = 'foo'
      const keyAlias = 'f'
      const definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      const actual = container.hasDefinition(keyAlias)

      // Assert.
      return assert.isFalse(actual)
    })
  })

  describe('has', () => {
    it('should return true if an alias was properly set', () => {
      // Arrange.
      class Foo {}

      const key = 'foo'
      const keyAlias = 'f'
      const definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      const actual = container.has(keyAlias)

      // Assert.
      return assert.isTrue(actual)
    })

    it('should return true if a parameter was properly set', () => {
      // Arrange.
      const key = 'foo'
      container.setParameter(key, 'bar')

      // Act.
      const actual = container.has(key)

      // Assert.
      return assert.isTrue(actual)
    })

    it('should return true if a parameter was properly set', () => {
      // Arrange.
      const key = 'foo'

      // Act.
      const actual = container.has(key)

      // Assert.
      return assert.isFalse(actual)
    })
  })

  describe('getDefinition', () => {
    it('should return the set definition', () => {
      // Arrange.
      class Foo {}

      const key = 'foo'
      const definition = new Definition(Foo)
      container.setDefinition(key, definition)

      // Act.
      const actual = container.getDefinition(key)

      // Assert.
      return assert.instanceOf(actual, Definition)
    })

    it('should throw an exception if the definition alias was not set', () => {
      // Arrange.
      class Foo {}

      const key = 'foo'
      const keyAlias = 'f'
      const definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      const actual = () => container.getDefinition(keyAlias)

      // Assert.
      return assert.throw(actual, Error, `${keyAlias} definition not found`)
    })

    it('should throw an exception if the definition was not set', () => {
      // Arrange.
      const key = 'foo'

      // Act.
      const actual = () => container.getDefinition(key)

      // Assert.
      return assert.throw(actual, Error, `${key} definition not found`)
    })
  })

  describe('findDefinition', () => {
    it('should return a definition if an alias was properly set', () => {
      // Arrange.
      class Foo {}

      const key = 'foo'
      const keyAlias = 'f'
      const definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      const actual = container.findDefinition(keyAlias)

      // Assert.
      return assert.instanceOf(actual, Definition)
    })

    it('should throw an exception if a definition was not set properly', () => {
      // Arrange.
      const key = 'foo'

      // Act.
      const actual = () => container.findDefinition(key)

      // Assert.
      return assert.throw(actual, Error, `${key} definition not found`)
    })
  })

  describe('removeDefinition', () => {
    it('should remove an already registered definition', () => {
      // Arrange.
      const key = 'foo'

      class Foo {}

      const definition = new Definition(Foo)
      container.setDefinition(key, definition)

      // Act.
      container.removeDefinition(key)

      // Assert.
      return assert.isUndefined(container._definitions.get(key))
    })

    it('should throw an exception if we try to remove an undefined definition',
      () => {
        // Arrange.
        const key = 'foo'

        // Act.
        const actual = () => container.removeDefinition(key)

        // Assert.
        return assert.throw(actual, Error, `${key} definition not found`)
      })
  })

  describe('registerExtension', () => {
    it(
      'should throw an exception if the extension instance does not have the load method',
      () => {
        // Arrange.
        class FooExtension {}

        // Act.
        const actual = () => container.registerExtension(new FooExtension())

        // Assert.
        assert.throw(actual, Error,
          'The extension FooExtension does not have the load method')
      })

    it('should register the extension properly', () => {
      // Arrange.
      class FooExtension {load () {}}

      // Act.
      container.registerExtension(new FooExtension())

      // Assert.
      assert.lengthOf(container.extensions, 1)
    })
  })

  describe('set', () => {
    it('should set directly an instance in to the container', () => {
      // Arrange.
      const syntheticServiceName = 'foo'

      class SyntheticService {}

      // Act.
      container.set(syntheticServiceName, new SyntheticService())

      // Assert.
      assert.strictEqual(container._container.size, 1)
    })
  })
})
