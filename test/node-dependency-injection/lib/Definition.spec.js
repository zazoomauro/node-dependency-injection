/* global describe, beforeEach, it */

import chai from 'chai'
import Definition from '../../../lib/Definition'

let assert = chai.assert

describe('Definition', () => {
  let definition

  beforeEach(() => {
    definition = new Definition('foo')
  })

  describe('addArgument', () => {
    it('should add one element to arguments array', () => {
      // Arrange.
      let argument = 'foobar'

      // Act.
      definition.addArgument(argument)

      // Assert.
      assert.lengthOf(definition.args, 1)
    })

    it('should add more than one argument to arguments', () => {
      // Arrange.
      let argument1 = 'foobar'
      let argument2 = 'barfoo'

      // Act.
      definition.addArgument(argument1).addArgument(argument2)

      // Assert.
      assert.lengthOf(definition.args, 2)
    })
  })

  describe('set', () => {
    it('should set to param properly an argument', () => {
      // Arrange.
      const param = 'fake'
      const argument = 'foo'

      // Act.
      definition.set(param, argument)

      // Assert.
      return assert.lengthOf(definition.setters, 1)
    })
  })

  describe('addMethodCall', () => {
    it('should throw an exception if the method name is empty', () => {
      // Arrange.
      let method = ''

      // Act.
      let actual = () => { definition.addMethodCall(method) }

      // Assert.
      assert.throw(actual, Error, 'Method name cannot be empty')
    })

    it('should add one method to the calls array', () => {
      // Arrange.
      let method = 'foo'

      // Act.
      definition.addMethodCall(method)

      // Assert.
      assert.strictEqual(definition.calls[0].method, method)
      assert.lengthOf(definition.calls[0].args, 0)
    })

    it('should add one method to the calls array with arguments', () => {
      // Arrange.
      let method = 'foo'
      let args = ['bar', 'foo']

      // Act.
      definition.addMethodCall(method, args)

      // Assert.
      assert.lengthOf(definition.calls[0].args, 2)
    })
  })

  describe('set args', () => {
    it('should override the entire arguments collection', () => {
      // Arrange.
      let args = ['foo', 'bar', 'foobar']

      // Act.
      definition.args = args

      // Assert.
      assert.lengthOf(definition.args, args.length)
    })
  })

  describe('addTag', () => {
    it('should add a new tag', () => {
      // Arrange.
      let tagName = 'foo'

      // Act.
      definition.addTag(tagName)

      // Assert.
      assert.lengthOf(definition.tags, 1)
    })

    it('should add a new tag with attributes', () => {
      // Arrange.
      let tagName = 'foo'
      let attributes = new Map()

      // Act.
      definition.addTag(tagName, attributes)

      // Assert.
      assert.lengthOf(definition.tags, 1)
    })

    it('should throw an exception if attributes is an exception', () => {
      // Arrange.
      let tagName = 'foo'
      let attributes = {}

      // Act.
      let actual = () => definition.addTag(tagName, attributes)

      // Assert.
      assert.throw(actual, Error, 'Attributes is not type Map')
    })
  })

  describe('addProperty', () => {
    it('should add a new property', () => {
      // Arrange.
      let key = 'foo'
      let value = 'bar'

      // Act.
      definition.addProperty(key, value)

      // Assert.
      assert.lengthOf(definition.properties, 1)
    })
  })

  describe('lazy', () => {
    it('should set as true', () => {
      // Arrange not needed.

      // Act.
      definition.lazy = true

      // Assert.
      assert.isTrue(definition.lazy)
    })
  })

  describe('deprecated', () => {
    it('should set as true', () => {
      // Arrange not needed.

      // Act.
      definition.deprecated = true

      // Assert.
      assert.isTrue(definition.deprecated)
    })

    it('should set as false', () => {
      // Arrange.
      definition.deprecated = true

      // Act.
      definition.deprecated = false

      // Assert.
      assert.isFalse(definition.deprecated)
    })
  })

  describe('synthetic', () => {
    it('should set as true', () => {
      // Arrange not needed.

      // Act.
      definition.synthetic = true

      // Assert.
      assert.isTrue(definition.synthetic)
    })

    it('should set as false', () => {
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

      let method = 'getFactory'

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
      let service = 'bar'

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
      let priority = 2

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
