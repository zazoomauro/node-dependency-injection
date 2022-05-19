import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import JsonFileLoader from '../../../../lib/Loader/JsonFileLoader'
import ContainerBuilder from '../../../../lib/ContainerBuilder'
import Foo from '../../../Resources-ts/Foo'
import Bar from '../../../Resources-ts/Bar'
import FooBar from '../../../Resources-ts/Foobar'
import path from 'path'
import RepositoryManager from '../../../Resources-ts/RepositoryManager'
import RepositoryFoo from '../../../Resources-ts/RepositoryFoo'
import RepositoryBar from '../../../Resources-ts/RepositoryBar'

chai.use(chaiAsPromised)
const assert = chai.assert

describe('JsonFileLoaderTs', () => {
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
      const actual = loader.load(file)

      // Assert.
      return assert.isRejected(actual, Error, `File ${file} not found`)
    })

    it('should load a simple container', async () => {
      // Arrange.
      const serviceName = 'foo'
      const aliasName = 'f'
      const tagName = 'fooTag'
      const stringParameterName = 'fooParameter'
      const stringExpectedParameter = 'barValue'
      const arrayParameterName = 'barParameter'
      const stringPropertyExpected = 'fooProperty'
      const envVariableExpected = 'test'

      // Act.
      await loader.load(
        path.join(__dirname, '/../../../Resources-ts/config/fake-services.json'))
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
      assert.isFunction(service.fs.writeFileSync)
      assert.strictEqual(service.param, 'foo-bar')
      assert.strictEqual(aliasService, service)
      assert.lengthOf(taggedServices, 2)
      assert.strictEqual(stringActualParameter, stringExpectedParameter)
      assert.isArray(arrayActualParameter)
      assert.strictEqual(service.env, envVariableExpected)
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

    it('should load multiple service files', async () => {
      // Arrange.
      const serviceName = 'foo'

      // Act.
      await loader.load(
        path.join(__dirname, '/../../../Resources-ts/config/fake-services.json'))
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

    it('should load multiple service files in subfolder', async () => {
      // Arrange.
      const barServiceName = 'bar'
      const bazServiceName = 'baz'
      const configPath = path.join(__dirname,
        '/../../../Resources-ts/config/fake-import-subfolder.json')

      // Act.
      await loader.load(configPath)
      const bar = container.get(barServiceName)
      const baz = container.get(bazServiceName)

      // Assert.
      assert.instanceOf(bar, FooBar)
      return assert.instanceOf(baz, FooBar)
    })
  })

  describe('load with tags', () => {
    beforeEach(async () => {
      container = new ContainerBuilder()
      loader = new JsonFileLoader(container)
      await container.compile()
    })

    it('should load instance of service with tagged arguments', async () => {
      // Arrange.
      const configPath = path.join(
        __dirname,
        '/../../../Resources-ts/config/tagged-arguments.json'
      )

      // Act.
      await loader.load(configPath)
      const repositoryManager = container.get('repository-manager')
      const repositoryFoo = container.get('repository-foo')
      const repositoryBar = container.get('repository-bar')

      // Assert.
      assert.instanceOf(repositoryManager, RepositoryManager)
      assert.instanceOf(repositoryFoo, RepositoryFoo)
      assert.instanceOf(repositoryBar, RepositoryBar)
      assert.equal(repositoryManager.repositories.length, 2)
    })
  })
})
