/* global describe, beforeEach, it */

import chai from 'chai'
import JsonFileLoader from '../../../../lib/Loader/JsonFileLoader'
import ContainerBuilder from '../../../../lib/ContainerBuilder'
import Foo from '../../../Resources/foo'
import Bar from '../../../Resources/bar'
import FooBar from '../../../Resources/foobar'
import path from 'path'

let assert = chai.assert

describe('JsonFileLoader', () => {
  let loader
  let container
  let logger = {warn: () => {}}

  describe('load', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      container.logger = logger
      loader = new JsonFileLoader(container)
    })

    it('should throw an exception if the json file not exists', () => {
      // Arrange.
      let file = 'fake-filePath.json'

      // Act.
      let actual = () => loader.load(file)

      // Assert.
      return assert.throw(actual, Error, `File ${file} not found`)
    })

    it('should load a simple container', () => {
      // Arrange.
      let serviceName = 'foo'
      let aliasName = 'f'
      let tagName = 'fooTag'
      let stringParameterName = 'fooParameter'
      let stringExpectedParameter = 'barValue'
      let arrayParameterName = 'barParameter'
      let stringPropertyExpected = 'fooProperty'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.json'))
      let service = container.get(serviceName)
      let aliasService = container.get(aliasName)
      let taggedServices = container.findTaggedServiceIds(tagName)
      let stringActualParameter = container.getParameter(stringParameterName)
      let arrayActualParameter = container.getParameter(arrayParameterName)
      let serviceWithObjectParameter = container.get(
        'service_with_object_parameter')

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
      assert.strictEqual(service.property, stringPropertyExpected)
      assert.isObject(serviceWithObjectParameter.fooManager)

      return assert.lengthOf(arrayActualParameter, 2)
    })
  })

  describe('load multiple imports', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      container.logger = logger
      loader = new JsonFileLoader(container)
    })

    it('should load multiple service files', () => {
      // Arrange.
      let serviceName = 'foo'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.json'))
      let service = container.get(serviceName)

      // Assert.
      return assert.instanceOf(service, Foo)
    })
  })

  describe('load imports in subfolder', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      container.logger = logger
      loader = new JsonFileLoader(container)
    })

    it('should load multiple service files in subfolder', () => {
      // Arrange.
      let barServiceName = 'bar'
      let bazServiceName = 'baz'
      let configPath = path.join(__dirname,
        '/../../../Resources/config/fake-import-subfolder.json')

      // Act.
      loader.load(configPath)
      let bar = container.get(barServiceName)
      let baz = container.get(bazServiceName)

      // Assert.
      assert.instanceOf(bar, FooBar)
      return assert.instanceOf(baz, FooBar)
    })
  })
})
