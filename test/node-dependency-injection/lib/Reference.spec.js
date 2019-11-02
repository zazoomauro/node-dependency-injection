import { describe, it } from 'mocha'
import chai from 'chai'
import Reference from '../../../lib/Reference'

const assert = chai.assert

describe('Reference', () => {
  describe('id', () => {
    it('should get the right constructor id', () => {
      // Arrange.
      const id = 'foobar'

      // Act.
      const actual = new Reference(id)

      // Assert.
      assert.strictEqual(actual.id, id)
    })
  })

  describe('nullable', () => {
    it('should get the right constructor id', () => {
      // Arrange.
      const nullable = true

      // Act.
      const actual = new Reference('foo', nullable)

      // Assert.
      assert.isTrue(actual.nullable)
    })
  })
})
