/* global describe, beforeEach, it */

import chai from 'chai'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Foo from '../../Resources/foo'
import FooManager from '../../Resources/fooManager'
import Bar from '../../Resources/bar'
import FooBar from '../../Resources/foobar'
import path from 'path'

let assert = chai.assert

describe('YamlFileLoader', () => {
  let loader
  let container

  describe('load', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new YamlFileLoader(container, path.join(__dirname, '/../../Resources/config/fake-services.yml'))
    })

    it('should throw an exception if the yaml file not exists', () => {
      // Arrange.
      let path = 'fake-filePath.yml'
      loader = new YamlFileLoader(container, path)

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
      loader = new YamlFileLoader(container, path.join(__dirname, '/../../Resources/config/fake-imports.yml'))
    })

    it('should load multiple service files', () => {
      // Arrange.
      let serviceName1 = 'foo'
      let serviceName2 = 'foo_manager'

      // Act.
      loader.load()
      let service1 = container.get(serviceName1)
      let service2 = container.get(serviceName2)

      // Assert.
      assert.instanceOf(service1, Foo)
      assert.instanceOf(service2, FooManager)
    })
  })
})
