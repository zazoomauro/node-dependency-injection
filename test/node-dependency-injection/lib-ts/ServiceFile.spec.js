import { describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import ServiceFileNotAbsolute from "../../../lib/Exception/ServiceFileNotAbsolute"
import ServiceFileNotValidExtension from "../../../lib/Exception/ServiceFileNotValidExtension"
import ServiceFile from "../../../lib/ServiceFile"

const assert = chai.assert

describe('ServiceFile', () => {
  it('should not generate a working services file if path is not absolute', async () => {
    // Arrange.
    const dumpPath = 'tmp/services.yml'

    // Act.
    const actual = () => new ServiceFile(dumpPath)

    // Assert.
    assert.throws(actual, ServiceFileNotAbsolute)
  })

  it('should not generate a working services file if path extension is not valid', async () => {
    // Arrange.
    const dumpPath = '/tmp/services.txt'

    // Act.
    const actual = () => new ServiceFile(dumpPath)

    // Assert.
    assert.throws(actual, ServiceFileNotValidExtension)
  })
})
