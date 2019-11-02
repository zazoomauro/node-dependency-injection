import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import JsonFileLoader from '../../../../lib/Loader/JsonFileLoader'
import ContainerBuilder from '../../../../lib/ContainerBuilder'
import Foo from '../../../Resources/foo'
import Bar from '../../../Resources/bar'
import FooBar from '../../../Resources/foobar'
import path from 'path'

const assert = chai.assert

describe('JsonFileLoader', () => {
  let loader
  let container
  const logger = { warn: () => {} }

  describe('load', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      container.logger = logger
      loader = new JsonFileLoader(container)
    })

    it('should throw an exception if the json file not exists', () => {
      // Arrange.
      const file = 'fake-filePath.json'

      // Act.
      const actual = () => loader.load(file)

      // Assert.
      return assert.throw(actual, Error, `File ${file} not found`)
    })

    it('should load a simple container', () => {
      // Arrange.
      const serviceName = 'foo'
      const aliasName = 'f'
      const tagName = 'fooTag'
      const stringParameterName = 'fooParameter'
      const stringExpectedParameter = 'barValue'
      const arrayParameterName = 'barParameter'
      const stringPropertyExpected = 'fooProperty'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.json'))
      const service = container.get(serviceName)
      const aliasService = container.get(aliasName)
      const taggedServices = container.findTaggedServiceIds(tagName)
      const stringActualParameter = container.getParameter(stringParameterName)
      const arrayActualParameter = container.getParameter(arrayParameterName)
      const serviceWithObjectParameter = container.get(
        'service_with_object_parameter')

      // Assert.
      assert.instanceOf(service, Foo)
      assert.instanceOf(service.bar, Bar)
      assert.instanceOf(service.bar.barMethod, FooBar)
      assert.isFunction(service.fs.copy)
      assert.strictEqual(service.param, 'foo-bar')
      assert.strictEqual(aliasService, service)
      assert.lengthOf(taggedServices, 2)
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
      const serviceName = 'foo'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.json'))
      const service = container.get(serviceName)

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
      const barServiceName = 'bar'
      const bazServiceName = 'baz'
      const configPath = path.join(__dirname,
        '/../../../Resources/config/fake-import-subfolder.json')

      // Act.
      loader.load(configPath)
      const bar = container.get(barServiceName)
      const baz = container.get(bazServiceName)

      // Assert.
      assert.instanceOf(bar, FooBar)
      return assert.instanceOf(baz, FooBar)
    })
  })
})
