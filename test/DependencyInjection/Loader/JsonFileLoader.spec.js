/* global describe, beforeEach, it */

import chai from 'chai'
import JsonFileLoader from '../../../lib/Loader/JsonFileLoader'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import Foo from '../../Resources/foo'
import Bar from '../../Resources/bar'
import FooBar from '../../Resources/foobar'
import path from 'path'

let assert = chai.assert

describe('JsonFileLoader', () => {
  let loader
  let container

  describe('load', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new JsonFileLoader(container, path.join(__dirname, '/../../Resources/config/fake-services.json'))
    })

    it('should throw an exception if the json file not exists', () => {
      // Arrange.
      let path = 'fake-filePath.json'
      loader = new JsonFileLoader(container, path)

      // Act.
      let actual = () => loader.load()

      // Assert.
      return assert.throws(actual, Error, 'The file ' + path + ' not exists')
    })

    it('should load a simple container', () => {
      // Arrange.
      let serviceName = 'foo'
      let aliasName = 'f'
      let tagName = 'fooTag'
      let stringParameterName = 'fooParameter'
      let stringExpectedParameter = 'barValue'
      let arrayParameterName = 'barParameter'

      // Act.
      loader.load()
      let service = container.get(serviceName)
      let aliasService = container.get(aliasName)
      let taggedServices = container.findTaggedServiceIds(tagName)
      let stringActualParameter = container.getParameter(stringParameterName)
      let arrayActualParameter = container.getParameter(arrayParameterName)

      // Assert.
      assert.instanceOf(service, Foo)
      assert.instanceOf(service.bar, Bar)
      assert.instanceOf(service.bar.barMethod, FooBar)
      assert.isFunction(service.fs.copy)
      assert.strictEqual(service.param, 'foo-bar')
      assert.strictEqual(aliasService, service)
      assert.lengthOf(taggedServices.toArray(), 2)
      assert.strictEqual(stringActualParameter, stringExpectedParameter)
      assert.isArray(arrayActualParameter)
      assert.strictEqual(service.parameter, stringExpectedParameter)

      return assert.lengthOf(arrayActualParameter, 2)
    })
  })

  describe('load multiple imports', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new JsonFileLoader(container, path.join(__dirname, '/../../Resources/config/fake-imports.json'))
    })

    it('should load multiple service files', () => {
      // Arrange.
      let serviceName = 'foo'

      // Act.
      loader.load()
      let service = container.get(serviceName)

      // Assert.
      return assert.instanceOf(service, Foo)
    })
  })
})
