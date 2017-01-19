/* global describe, beforeEach, it */

import chai from 'chai'
import JsonFileLoader from '../../../lib/Loader/JsonFileLoader'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Foo from '../../Resources/foo'
import Bar from '../../Resources/bar'
import path from 'path'

let assert = chai.assert

describe('JsonFileLoader', () => {
  let loader
  let container

  beforeEach(() => {
    container = new ContainerBuilder()
    loader = new JsonFileLoader(container, path.join(__dirname, '/../../Resources/fake-services.json'))
  })

  describe('load', () => {
    it('should throw an exception if the json file not exists', () => {
      // Arrange.
      let path = 'fake-filePath.json'
      loader = new JsonFileLoader(container, path)

      // Act.
      let actual = () => loader.load()

      // Assert.
      assert.throws(actual, Error, 'The file not exists')
    })

    it('should load a simple container', () => {
      // Arrange.
      let serviceName = 'foo'

      // Act.
      loader.load()
      let service = container.get(serviceName)

      // Assert.
      assert.instanceOf(service, Foo)
      assert.instanceOf(service.bar, Bar)
      assert.isFunction(service.fs.copy)
      assert.strictEqual(service.param, 'foo-bar')
    })
  })
})
