/* global describe, beforeEach, it */

import chai from 'chai'
import Definition from '../../lib/Definition'

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
      definition
        .addArgument(argument1)
        .addArgument(argument2)

      // Assert.
      assert.lengthOf(definition.args, 2)
    })
  })

  describe('addMethodCall', () => {
    it('should throw an exception if the method name is empty', () => {
      // Arrange.
      let method = ''

      // Act.
      let actual = () => { definition.addMethodCall(method) }

      // Assert.
      assert.throw(actual, Error, 'Method name cannot be empty.')
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
})
