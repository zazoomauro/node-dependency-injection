import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import Definition from '../../../lib/Definition'

const assert = chai.assert

describe('Definition', () => {
  let definition

  beforeEach(() => {
    definition = new Definition('foo')
  })

  describe('addArgument', () => {
    it('should add one element to arguments array', () => {
      // Arrange.
      const argument = 'foobar'

      // Act.
      definition.addArgument(argument)

      // Assert.
      assert.lengthOf(definition.args, 1)
    })

    it('should add more than one argument to arguments', () => {
      // Arrange.
      const argument1 = 'foobar'
      const argument2 = 'barfoo'

      // Act.
      definition.addArgument(argument1).addArgument(argument2)

      // Assert.
      assert.lengthOf(definition.args, 2)
    })
  })

  describe('addMethodCall', () => {
    it('should throw an exception if the method name is empty', () => {
      // Arrange.
      const method = ''

      // Act.
      const actual = () => { definition.addMethodCall(method) }

      // Assert.
      assert.throw(actual, Error, 'Method name cannot be empty')
    })

    it('should add one method to the calls array', () => {
      // Arrange.
      const method = 'foo'

      // Act.
      definition.addMethodCall(method)

      // Assert.
      assert.strictEqual(definition.calls[0].method, method)
      assert.lengthOf(definition.calls[0].args, 0)
    })

    it('should add one method to the calls array with arguments', () => {
      // Arrange.
      const method = 'foo'
      const args = ['bar', 'foo']

      // Act.
      definition.addMethodCall(method, args)

      // Assert.
      assert.lengthOf(definition.calls[0].args, 2)
    })
  })

  describe('set args', () => {
    it('should override the entire arguments collection', () => {
      // Arrange.
      const args = ['foo', 'bar', 'foobar']

      // Act.
      definition.args = args

      // Assert.
      assert.lengthOf(definition.args, args.length)
    })
  })

  describe('addTag', () => {
    it('should add a new tag', () => {
      // Arrange.
      const tagName = 'foo'

      // Act.
      definition.addTag(tagName)

      // Assert.
      assert.lengthOf(definition.tags, 1)
    })

    it('should add a new tag with attributes', () => {
      // Arrange.
      const tagName = 'foo'
      const attributes = new Map()

      // Act.
      definition.addTag(tagName, attributes)

      // Assert.
      assert.lengthOf(definition.tags, 1)
    })

    it('should throw an exception if attributes is an exception', () => {
      // Arrange.
      const tagName = 'foo'
      const attributes = {}

      // Act.
      const actual = () => definition.addTag(tagName, attributes)

      // Assert.
      assert.throw(actual, Error, 'Attributes is not type Map')
    })
  })

  describe('addProperty', () => {
    it('should add a new property', () => {
      // Arrange.
      const key = 'foo'
      const value = 'bar'

      // Act.
      definition.addProperty(key, value)

      // Assert.
      assert.lengthOf(definition.properties, 1)
    })
  })

  describe('lazy', () => {
    it('should set as true as lazy', () => {
      // Arrange not needed.

      // Act.
      definition.lazy = true

      // Assert.
      assert.isTrue(definition.lazy)
    })
  })

  describe('deprecated', () => {
    it('should set as true as deprecated', () => {
      // Arrange not needed.

      // Act.
      definition.deprecated = true

      // Assert.
      assert.isTrue(definition.deprecated)
    })

    it('should set as false as deprecated', () => {
      // Arrange.
      definition.deprecated = true

      // Act.
      definition.deprecated = false

      // Assert.
      assert.isFalse(definition.deprecated)
    })
  })

  describe('synthetic', () => {
    it('should set as true as synthetic', () => {
      // Arrange not needed.

      // Act.
      definition.synthetic = true

      // Assert.
      assert.isTrue(definition.synthetic)
    })

    it('should set as false as synthetic', () => {
      // Arrange.
      definition.synthetic = true

      // Act.
      definition.synthetic = false

      // Assert.
      assert.isFalse(definition.synthetic)
    })
  })

  describe('setFactory', () => {
    it('should store the factory with object and method', () => {
      // Arrange.
      class Foo {}

      const method = 'getFactory'

      // Act.
      definition.setFactory(Foo, method)

      // Assert.
      assert.strictEqual(definition.factory.Object, Foo)
      assert.strictEqual(definition.factory.method, method)
    })
  })

  describe('public', () => {
    it('should set as true', () => {
      // Arrange not needed.

      // Act.
      definition.public = true

      // Assert.
      assert.isTrue(definition.public)
    })

    it('should set as false', () => {
      // Arrange not needed.

      // Act not needed.
      definition.public = false

      // Assert.
      assert.isFalse(definition.public)
    })
  })

  describe('shared', () => {
    it('should set as true', () => {
      // Arrange not needed.

      // Act.
      definition.shared = true

      // Assert.
      assert.isTrue(definition.shared)
    })

    it('should set as false', () => {
      // Arrange not needed.

      // Act not needed.
      definition.shared = false

      // Assert.
      assert.isFalse(definition.shared)
    })
  })

  describe('decoratedService', () => {
    it('should set a decorated service', () => {
      // Arrange.
      const service = 'bar'

      // Act.
      definition.decoratedService = service

      // Assert.
      assert.strictEqual(definition.decoratedService, service)
    })

    it('should get null as default decorated service', () => {
      // No Arrange.

      // No Act.

      // Assert.
      assert.isNull(definition.decoratedService)
    })
  })

  describe('decorationPriority', () => {
    it('should set a decorated priority', () => {
      // Arrange.
      const priority = 2

      // Act.
      definition.decorationPriority = priority

      // Assert.
      assert.strictEqual(definition.decorationPriority, priority)
    })

    it('should get null as default decorated service', () => {
      // No Arrange.

      // No Act.

      // Assert.
      assert.isNull(definition.decorationPriority)
    })
  })
})
