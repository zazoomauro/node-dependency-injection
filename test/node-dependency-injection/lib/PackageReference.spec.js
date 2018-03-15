/* global describe, it */

import chai from 'chai'
import PackageReference from '../../../lib/PackageReference'

let assert = chai.assert

describe('PackageReference', () => {
  describe('id', () => {
    it('should get the right constructor id', () => {
      // Arrange.
      let id = 'foobar'

      // Act.
      let actual = new PackageReference(id)

      // Assert.
      assert.strictEqual(actual.id, id)
    })
  })
})
