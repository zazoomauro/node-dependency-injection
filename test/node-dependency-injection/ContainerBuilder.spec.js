/* global describe, beforeEach, it */

import chai from 'chai'
import ContainerBuilder from '../../lib/ContainerBuilder'
import Definition from '../../lib/Definition'
import Reference from '../../lib/Reference'
import YamlFileLoader from '../../lib/Loader/YamlFileLoader'
import path from 'path'
import FooManager from './../Resources/fooManager'
import BarManager from './../Resources/barManager'

let assert = chai.assert

describe('ContainerBuilder', () => {
  let container

  beforeEach(() => {
    container = new ContainerBuilder()
  })

  describe('register', () => {
    it('should return a definition instance', () => {
      // Arrange.
      let id = 'foo'
      let className = 'bar'

      // Act.
      let actual = container.register(id, className)

      // Assert.
      return assert.instanceOf(actual, Definition)
    })
  })

  describe('get', () => {
    it('should throw an exception if the service not exists', () => {
      // Arrange.
      let id = 'service._foo_bar'

      // Act.
      let actual = () => container.get(id)

      // Assert.
      return assert.throws(actual, Error, `The service ${id} is not registered`)
    })

    it('should return the right service', () => {
      // Arrange.
      let id = 'service.foo'
      class Foo {
      }
      container.register(id, Foo)

      // Act.
      let actual = container.get(id)

      // Assert.
      return assert.instanceOf(actual, Foo)
    })

    it('should return the right service with argument in the constructor', () => {
      // Arrange.
      let id = 'service.foo'
      let param = 'foo bar'
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
      let actual = container.get(id)

      // Assert.
      return assert.strictEqual(actual.param, param)
    })

    it('should return the right service with reference argument', () => {
      // Arrange.
      let id = 'service.foo'
      let referenceId = 'service.bar'
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
      let actual = container.get(id)

      // Assert.
      return assert.instanceOf(actual.bar, Bar)
    })

    it('should return the right service with reference argument', () => {
      // Arrange.
      let id = 'service.foo'
      let reference1Id = 'service.bar'
      let reference2Id = 'service.foo_bar'
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
      container.register(reference1Id, Bar).addArgument(new Reference(reference2Id))
      container.register(id, Foo).addArgument(new Reference(reference1Id))

      // Act.
      let actual = container.get(id)

      // Assert.
      assert.instanceOf(actual.bar, Bar)
      return assert.instanceOf(actual.bar.fooBar, FooBar)
    })

    it('should call the method without any argument', () => {
      // Arrange.
      let id = 'service.foo'
      let parameter = 'foobar'
      class Foo {
        bar (parameter) {
          this._parameter = parameter
        }

        get parameter () {
          return this._parameter
        }
      }
      container
        .register(id, Foo)
        .addMethodCall('bar', [parameter])
        .addMethodCall('fake')

      // Act.
      let foo = container.get(id)

      // Assert.
      return assert.strictEqual(foo.parameter, parameter)
    })

    it('should get the service instance and instantiate ones multiple service dependency', () => {
      let fooId = 'service.foo'
      let barId = 'service.bar'
      let fooBarId = 'service.foo_bar'
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
      let serviceId = 'foo'
      let propertyKey = 'bar'
      let value = 'foo.bar'
      let definition = new Definition(Foo)
      definition.addProperty(propertyKey, value)
      container.setDefinition(serviceId, definition)

      // Act.
      let actual = container.get(serviceId)

      // Assert.
      return assert.strictEqual(actual.bar, value)
    })
  })

  describe('compile', () => {
    it('should compile the container and froze the same container', () => {
      // Arrange not needed.

      // Act.
      container.compile()

      // Assert.
      return assert.isTrue(container.frozen)
    })

    it('should compile the container and return a service', () => {
      // Arrange.
      let id = 'service.foo'
      let parameter = 'foobar'
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
      container.compile()

      // Assert.
      return assert.strictEqual(container.get(id).parameter, parameter)
    })

    it('should not register more services when the container is already frozen', () => {
      // Arrange.
      container.register('foo', class Foo {})

      // Act.
      container.compile()
      let actual = () => container.register('bar', class Bar {})

      // Assert.
      return assert.throws(actual, Error, 'You cannot register more services when the container is frozen')
    })

    it('should prevent instantiate class again if we get a service and then compile', () => {
      let fooId = 'service.foo'
      let constructorCalls = 0
      class Foo {
        constructor () {
          constructorCalls++
        }
      }
      container.register(fooId, Foo)
      container.get(fooId)

      // Act.
      container.compile()
      let foo = container.get(fooId)

      // Assert.
      assert.strictEqual(constructorCalls, 1)
      return assert.instanceOf(foo, Foo)
    })

    it('should process the registered pass process method', () => {
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
      container.compile()

      // Assert.
      assert.isTrue(processedPass)
      return assert.strictEqual(container, expectedContainer)
    })

    it('should not instantiate twice even if there is a compiler pass during compilation', () => {
      // Arrange.
      let actualCompilations = 0

      class FooPass {
        process (container) {
          actualCompilations++
        }
      }
      container.addCompilerPass(new FooPass())

      // Act.
      container.compile()
      container.compile()

      // Assert.
      return assert.strictEqual(actualCompilations, 1)
    })

    it('should not instantiate a service twice even if a dependency needs another service from yml loader', () => {
      // Arrange.
      FooManager.prototype.fooManagerCalls = 0
      let loader = new YamlFileLoader(container)
      loader.load(path.join(__dirname, '../Resources/config/fake-services-2.yml'))

      // Act.
      container.compile()

      // Assert.
      return assert.strictEqual(FooManager.prototype.fooManagerCalls, 1)
    })

    it('should not instantiate a service twice even if a dependency needs another service from container builder', () => {
      // Arrange.
      FooManager.prototype.fooManagerCalls = 0
      container.register('foo_manager', FooManager)
      container.register('bar_manager', BarManager).addArgument(new Reference('foo_manager'))

      // Act.
      container.compile()

      // Assert.
      return assert.strictEqual(FooManager.prototype.fooManagerCalls, 1)
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
      let serviceId = 'foo'
      let propertyKey = 'bar'
      let value = 'foo.bar'
      let definition = new Definition(Foo)
      definition.addProperty(propertyKey, value)
      container.setDefinition(serviceId, definition)

      // Act.
      container.compile()

      // Assert.
      return assert.strictEqual(container.get(serviceId).bar, value)
    })
  })

  describe('addCompilerPass', () => {
    it('should throw an error if the registered compiler pass do not have process method', () => {
      // Arrange.
      class FooPass {}

      // Act.
      let actual = () => container.addCompilerPass(new FooPass())

      // Assert.
      return assert.throws(actual, Error, 'Your compiler pass does not have the process method')
    })

    it('should register properly a compiler pass if has the process method', () => {
      // Arrange.
      class FooPass {
        process () {}
      }

      // Act.
      container.addCompilerPass(new FooPass())

      // Assert.
      return assert.strictEqual(container._compilerPass.length, 1)
    })
  })

  describe('setAlias', () => {
    it('should return the same service type using aliasing', () => {
      // Arrange.
      let fooId = 'service.foo'
      let aliasId = 'foo'
      class Foo {}
      container.register(fooId, Foo)

      // Act.
      container.setAlias(aliasId, fooId)
      let actual = container.get(aliasId)

      // Assert.
      return assert.instanceOf(actual, Foo)
    })

    it('should return the same service instance using aliasing', () => {
      // Arrange.
      let fooId = 'service.foo'
      let aliasId = 'foo'
      class Foo {}
      container.register(fooId, Foo)
      container.setAlias(aliasId, fooId)
      let expected = container.get(fooId)

      // Act.
      let actual = container.get(aliasId)

      // Assert.
      return assert.strictEqual(actual, expected)
    })
  })

  describe('setDefinition', () => {
    it('should throw an exception if the sent definition argument is not a Definition', () => {
      // Arrange.
      let definition = 'foo'

      // Act.
      let actual = () => container.setDefinition('bar', definition)

      // Assert.
      return assert.throws(actual, Error, 'You cannot register not valid definition')
    })

    it('should register the definition properly and return the definition', () => {
      // Arrange.
      class Foo {}
      let definition = new Definition(Foo)
      let id = 'foo'

      // Act.
      container.setDefinition(id, definition)

      // Assert.
      return assert.instanceOf(container.get(id), Foo)
    })

    it('should add the right arguments dependencies in the definition constructor', () => {
      // Arrange.
      class Foo {
        constructor (string) {
          this.string = string
        }
      }
      let id = 'foo'
      let stringValue = 'foo'
      let definition = new Definition(Foo, [stringValue])

      // Act.
      container.setDefinition(id, definition)
      let actual = container.get(id).string

      // Assert.
      return assert.strictEqual(actual, stringValue)
    })
  })

  describe('findTaggedServiceIds', () => {
    it('should return an array with tagged services', () => {
      // Arrange.
      class Foo {}
      let id = 'foo'
      let tag = 'fooTag'
      let definition = new Definition(Foo)
      definition.addTag(tag)
      container.setDefinition(id, definition)

      // Act.
      let actual = container.findTaggedServiceIds(tag)

      // Assert.
      return assert.lengthOf(actual.toArray(), 1)
    })

    it('should return an array with mutiple tagged services', () => {
      // Arrange.
      class Foo {}
      let id = 'foo'
      let fooTag = 'fooTag'
      let barTag = 'barTag'
      let definition = new Definition(Foo)
      definition
        .addTag(fooTag)
        .addTag(barTag)
      container.setDefinition(id, definition)

      // Act.
      let actual = container.findTaggedServiceIds(barTag)

      // Assert.
      return assert.lengthOf(actual.toArray(), 1)
    })
  })

  describe('setParameter', () => {
    it('should set a string parameter properly', () => {
      // Arrange.
      let key = 'foo.bar'
      let value = 'foobar'

      // Act.
      container.setParameter(key, value)

      // Assert.
      assert.strictEqual(container._parameters.get(key), value)
    })

    it('should set an array parameter properly', () => {
      // Arrange.
      let key = 'foo.bar'
      let value = ['foo', 'bar']

      // Act.
      container.setParameter(key, value)

      // Assert.
      assert.strictEqual(container._parameters.get(key), value)
    })

    it('should throw an exception if the set value is not a valid parameter', () => {
      // Arrange.
      let key = 'foo.bar'
      let value = {}

      // Act.
      let actual = () => container.setParameter(key, value)

      // Assert.
      return assert.throws(actual, TypeError, 'The expected value is not a flat string or an array')
    })
  })

  describe('getParameter', () => {
    it('should get a parameter properly', () => {
      // Arrange.
      let key = 'foo.bar'
      let value = 'foobar'
      container.setParameter(key, value)

      // Act.
      let actual = container.getParameter(key)

      // Assert.
      assert.strictEqual(actual, value)
    })
  })

  describe('hasParameter', () => {
    it('should return true if the parameters was previously set', () => {
      // Arrange.
      let key = 'foo.bar'
      let value = 'foobar'
      container.setParameter(key, value)

      // Act.
      let actual = container.hasParameter(key)

      // Assert.
      assert.isTrue(actual)
    })

    it('should return false if the parameters was not previously set', () => {
      // Arrange not needed.

      // Act.
      let actual = container.hasParameter('foo')

      // Assert.
      assert.isFalse(actual)
    })
  })

  describe('hasDefinition', () => {
    it('should return true if the definition was properly set', () => {
      // Arrange.
      class Foo {}
      let key = 'foo'
      let definition = new Definition(Foo)
      container.setDefinition(key, definition)

      // Act.
      let actual = container.hasDefinition(key)

      // Assert.
      return assert.isTrue(actual)
    })

    it('should return false if the definition if was not properly set', () => {
      // Arrange.
      let key = 'foo'

      // Act.
      let actual = container.hasDefinition(key)

      // Assert.
      return assert.isFalse(actual)
    })

    it('should return false if we are looking for an alias definition', () => {
      // Arrange.
      class Foo {}
      let key = 'foo'
      let keyAlias = 'f'
      let definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      let actual = container.hasDefinition(keyAlias)

      // Assert.
      return assert.isFalse(actual)
    })
  })

  describe('has', () => {
    it('should return true if an alias was properly set', () => {
      // Arrange.
      class Foo {}
      let key = 'foo'
      let keyAlias = 'f'
      let definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      let actual = container.has(keyAlias)

      // Assert.
      return assert.isTrue(actual)
    })

    it('should return true if a parameter was properly set', () => {
      // Arrange.
      let key = 'foo'
      container.setParameter(key, 'bar')

      // Act.
      let actual = container.has(key)

      // Assert.
      return assert.isTrue(actual)
    })

    it('should return true if a parameter was properly set', () => {
      // Arrange.
      let key = 'foo'

      // Act.
      let actual = container.has(key)

      // Assert.
      return assert.isFalse(actual)
    })
  })

  describe('getDefinition', () => {
    it('should return the set definition', () => {
      // Arrange.
      class Foo {}
      let key = 'foo'
      let definition = new Definition(Foo)
      container.setDefinition(key, definition)

      // Act.
      let actual = container.getDefinition(key)

      // Assert.
      return assert.instanceOf(actual, Definition)
    })

    it('should throw an exception if the definition alias was not set', () => {
      // Arrange.
      class Foo {}
      let key = 'foo'
      let keyAlias = 'f'
      let definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      let actual = () => container.getDefinition(keyAlias)

      // Assert.
      return assert.throws(actual, Error, `${keyAlias} definition not found`)
    })

    it('should throw an exception if the definition was not set', () => {
      // Arrange.
      let key = 'foo'

      // Act.
      let actual = () => container.getDefinition(key)

      // Assert.
      return assert.throws(actual, Error, `${key} definition not found`)
    })
  })

  describe('findDefinition', () => {
    it('should return a definition if an alias was properly set', () => {
      // Arrange.
      class Foo {}
      let key = 'foo'
      let keyAlias = 'f'
      let definition = new Definition(Foo)
      container.setDefinition(key, definition)
      container.setAlias(keyAlias, key)

      // Act.
      let actual = container.findDefinition(keyAlias)

      // Assert.
      return assert.instanceOf(actual, Definition)
    })

    it('should throw an exception if a definition was not set properly', () => {
      // Arrange.
      let key = 'foo'

      // Act.
      let actual = () => container.findDefinition(key)

      // Assert.
      return assert.throws(actual, Error, `${key} definition not found`)
    })
  })
})
