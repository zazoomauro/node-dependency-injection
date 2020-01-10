import { describe, it } from 'mocha'
import chai from 'chai'
import TagReference from '../../../lib/TagReference'

const assert = chai.assert

describe('TagReference', () => {
  describe('name', () => {
    it('should get the right constructor name', () => {
      // Arrange.
      const name = 'foobar'

      // Act.
      const actual = new TagReference(name)

      // Assert.
      assert.strictEqual(actual.name, name)
    })
  })
})
