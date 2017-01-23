/* global describe, beforeEach, it */

import chai from 'chai'
import ContainerBuilder from '../../lib/ContainerBuilder'
import Definition from '../../lib/Definition'
import Reference from '../../lib/Reference'

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
      assert.instanceOf(actual, Definition)
    })
  })

  describe('get', () => {
    it('should throw an exception if the service not exists', () => {
      // Arrange.
      let id = 'service._foo_bar'

      // Act.
      let actual = () => container.get(id)

      // Assert.
      assert.throws(actual, Error, 'The service ' + id + ' is not registered')
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
      assert.instanceOf(actual, Foo)
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
      assert.strictEqual(actual.param, param)
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
      assert.instanceOf(actual.bar, Bar)
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
      assert.instanceOf(actual.bar.fooBar, FooBar)
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

      let foo = container.get(id)

      // Act.

      // Assert.
      assert.strictEqual(foo.parameter, parameter)
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
      assert.strictEqual(constructorCalls, 1)
    })
  })

  describe('compile', () => {
    it('should compile the container and froze the same container', () => {
      // Arrange not needed.

      // Act.
      container.compile()

      // Assert.
      assert.isTrue(container.frozen)
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
      assert.strictEqual(container.get(id).parameter, parameter)
    })

    it('should not register more services when the container is already frozen', () => {
      // Arrange.
      container.register('foo', class Foo {})

      // Act.
      container.compile()
      let actual = () => container.register('bar', class Bar {})

      // Assert.
      assert.throws(actual, Error, 'You cannot register more services when the container is frozen')
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
      assert.instanceOf(foo, Foo)
    })
  })
})
