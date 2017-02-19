/* global describe, beforeEach, it */

import chai from 'chai'
import JsFileLoader from '../../../lib/Loader/JsFileLoader'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Foo from '../../Resources/foo'
import Bar from '../../Resources/bar'
import FooBar from '../../Resources/foobar'
import path from 'path'

let assert = chai.assert

describe('JsFileLoader', () => {
  let loader
  let container

  describe('load', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new JsFileLoader(container, path.join(__dirname, '/../../Resources/config/fake-services.js'))
    })

    it('should throw an exception if the js file not exists', () => {
      // Arrange.
      let path = 'fake-filePath.js'
      loader = new JsFileLoader(container, path)

      // Act.
      let actual = () => loader.load()

      // Assert.
      assert.throws(actual, Error, 'The file ' + path + ' not exists')
    })

    it('should load a simple container', () => {
      // Arrange.
      let serviceName = 'foo'
      let aliasName = 'f'

      // Act.
      loader.load()
      let service = container.get(serviceName)
      let aliasService = container.get(aliasName)
      let taggedServices = container.findTaggedServiceIds('fooTag')

      // Assert.
      assert.instanceOf(service, Foo)
      assert.instanceOf(service.bar, Bar)
      assert.instanceOf(service.bar.barMethod, FooBar)
      assert.isFunction(service.fs.copy)
      assert.strictEqual(service.param, 'foo-bar')
      assert.strictEqual(aliasService, service)
      assert.lengthOf(taggedServices.toArray(), 2)
    })
  })

  describe('load multiple imports', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new JsFileLoader(container, path.join(__dirname, '/../../Resources/config/fake-imports.js'))
    })

    it('should load multiple service files', () => {
      // Arrange.
      let serviceName = 'foo'

      // Act.
      loader.load()
      let service = container.get(serviceName)

      // Assert.
      assert.instanceOf(service, Foo)
    })
  })
})
