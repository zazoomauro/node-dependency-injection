import { describe, it } from 'mocha'
import chai from 'chai'
import PackageReference from '../../../lib/PackageReference'

const assert = chai.assert

describe('PackageReference', () => {
  describe('id', () => {
    it('should get the right constructor id', () => {
      // Arrange.
      const id = 'foobar'

      // Act.
      const actual = new PackageReference(id)

      // Assert.
      assert.strictEqual(actual.id, id)
    })
  })
})
