/* global describe, it */

import chai from 'chai'
import Reference from '../../../lib/Reference'

let assert = chai.assert

describe('Reference', () => {
  describe('id', () => {
    it('should get the right constructor id', () => {
      // Arrange.
      let id = 'foobar'

      // Act.
      let actual = new Reference(id)

      // Assert.
      assert.strictEqual(actual.id, id)
    })
  })

  describe('nullable', () => {
    it('should get the right constructor id', () => {
      // Arrange.
      let nullable = true

      // Act.
      let actual = new Reference('foo', nullable)

      // Assert.
      assert.isTrue(actual.nullable)
    })
  })
})
