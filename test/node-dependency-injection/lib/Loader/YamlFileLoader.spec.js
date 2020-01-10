import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import YamlFileLoader from '../../../../lib/Loader/YamlFileLoader'
import ContainerBuilder from '../../../../lib/ContainerBuilder'
import Foo from '../../../Resources/foo'
import FooManager from '../../../Resources/fooManager'
import Bar from '../../../Resources/bar'
import FooBar from '../../../Resources/foobar'
import path from 'path'
import MissingDependencies from '../../../Resources/missingDependencies'
import SyntheticService from '../../../Resources/syntheticService'
import Listener from '../../../Resources/listener'
import DecoratingMailer from '../../../Resources/DecoratingMailer'
import Mailer from '../../../Resources/Mailer'
import DecoratingMailerTwo from '../../../Resources/DecoratingMailerTwo'
import ChildClass from '../../../Resources/abstract/ChildClass'
import Service from '../../../Resources/abstract/Service'
import ClassThree, { ClassOne, ClassTwo } from '../../../Resources/MultipleExports'
import { NamedService } from '../../../Resources/NamedService'
import RepositoryManager from '../../../Resources/RepositoryManager'
import RepositoryFoo from '../../../Resources/RepositoryFoo'
import RepositoryBar from '../../../Resources/RepositoryBar'

const assert = chai.assert

describe('YamlFileLoader', () => {
  let loader
  let loaderSelfReference
  let container
  let containerSelfReference
  const logger = { warn: () => { } }

  describe('load', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      containerSelfReference = new ContainerBuilder(true)
      container.logger = logger
      loader = new YamlFileLoader(container)
      loaderSelfReference = new YamlFileLoader(containerSelfReference)
    })

    it('should inject the service container properly', () => {
      // Arrange.
      loaderSelfReference.load(path.join(__dirname,
        '/../../../Resources/config/container-self-reference.yml'))

      // Act.
      const actual = containerSelfReference.get('some_manager_with_container')

      // Assert.
      assert.instanceOf(actual.container, ContainerBuilder)
    })

    it('should throw an exception if service container ', () => {
      // Arrange.
      loader.load(path.join(__dirname,
        '/../../../Resources/config/container-self-reference.yml'))

      // Act.
      const actual = () => container.get('some_manager_with_container')

      // Assert.
      return assert.throw(actual,
        'The service service_container is not registered')
    })

    it('should load a container with a private npm package', () => {
      // Arrange.

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/private.yml'))
      const actual = () => container.get('foo')

      // Assert.
      return assert.throw(actual, 'Cannot find module \'@company/repository\'')
    })

    it('should load an abstract class with dependencies properly', () => {
      // Arrange not needed.

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/abstract.yml'))
      const childClass = container.get('app.child_class')
      const throwAbstractServiceException = () => container.get(
        'app.base_class')
      const throwNotAbstractServiceException = () => container.get(
        'app.failure.child_class')

      // Assert.
      assert.throw(throwAbstractServiceException, Error,
        'The service app.base_class is abstract')
      assert.instanceOf(childClass, ChildClass)
      assert.instanceOf(childClass.service, Service)
      assert.throw(throwNotAbstractServiceException, Error,
        'The parent service app.failure.base_class is not abstract')
    })

    it('should throw an exception if the yaml file not exists', () => {
      // Arrange.
      const file = 'fake-filePath.yml'

      // Act.
      const actual = () => loader.load(file)

      // Assert.
      return assert.throw(actual, Error, `Service file ${file} not found`)
    })

    it('should throw an exception if the yaml file had invalid syntax', () => {
      const actual = () => {
        loader.load(
          path.join(__dirname,
            '/../../../Resources/config/invalid-yaml-syntax.yml')
        )
      }

      return assert.throw(actual, Error, /^Service file could not be loaded\. /)
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
      const envVariableExpected = 'test'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.yml'))
      container.compile()
      const service = container.get(serviceName)
      const aliasService = container.get(aliasName)
      const taggedServices = container.findTaggedServiceIds(tagName)
      const stringActualParameter = container.getParameter(stringParameterName)
      const arrayActualParameter = container.getParameter(arrayParameterName)
      const fromFactoryWithoutArgs = container.get('from_factory_without_args')
      const fromFactoryWithArgs = container.get('from_factory_with_args')
      const fromFactoryWithReferenceWithoutArgs = container.get(
        'from_factory_with_reference_without_args')
      const fromFactoryWithReferenceWithArgs = container.get(
        'from_factory_with_reference_with_args')
      const fromFactoryWithReferenceWithServiceArg = container.get(
        'from_factory_with_reference_with_service_arg')
      const serviceMissingDependencies = container.get(
        'service_missing_dependencies')
      const serviceWithDependencies = container.get('service_with_dependencies')
      const serviceMissingDependenciesCall = container.get(
        'service_missing_dependencies_call')
      const serviceWithDependenciesCall = container.get(
        'service_with_dependencies_call')
      const fooWithTrue = container.get('foo_with_true')
      const fooWithFalse = container.get('foo_with_false')
      const throwPrivateServiceException = () => container.get('private_service')
      const serviceUsingPrivateService = container.get(
        'service_using_private_service')
      const listener = container.get('app.listener')
      const mailer = container.get('app.mailer')
      const mailerInner = container.get('app.decorating_mailer.inner')
      const serviceWithObjectParameter = container.get(
        'service_with_object_parameter')
      const decorateAppMailer = container.get('decorate.app.mailer')

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
      assert.instanceOf(fromFactoryWithoutArgs, FooBar)
      assert.instanceOf(fromFactoryWithArgs, FooBar)
      assert.instanceOf(fromFactoryWithReferenceWithoutArgs, FooBar)
      assert.instanceOf(fromFactoryWithReferenceWithArgs, FooBar)
      assert.instanceOf(fromFactoryWithReferenceWithServiceArg, FooBar)
      assert.instanceOf(serviceMissingDependencies, MissingDependencies)
      assert.isNull(serviceMissingDependencies.optional)
      assert.instanceOf(serviceWithDependencies, MissingDependencies)
      assert.instanceOf(serviceWithDependencies.optional, FooBar)
      assert.instanceOf(serviceMissingDependenciesCall, MissingDependencies)
      assert.isNull(serviceMissingDependenciesCall.optional)
      assert.instanceOf(serviceWithDependenciesCall, MissingDependencies)
      assert.instanceOf(serviceWithDependenciesCall.optional, FooBar)
      assert.isTrue(fooWithTrue.param)
      assert.isFalse(fooWithFalse.parameter)
      assert.throw(throwPrivateServiceException, Error,
        'The service private_service is private')
      assert.instanceOf(serviceUsingPrivateService.bar, Foo)
      assert.instanceOf(listener, Listener)
      assert.instanceOf(mailer, DecoratingMailer)
      assert.instanceOf(mailer.inner, Mailer)
      assert.instanceOf(mailerInner, Mailer)
      assert.isObject(serviceWithObjectParameter.fooManager)
      assert.instanceOf(decorateAppMailer.inner, DecoratingMailerTwo)

      return assert.lengthOf(arrayActualParameter, 2)
    })

    it('should load properly a not shared service', () => {
      // Arrange.
      const notSharedServiceName = 'not_shared_service'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.yml'))
      const actual = container.get(notSharedServiceName)
      const expected = container.get(notSharedServiceName)

      // Assert.
      return assert.notStrictEqual(actual, expected)
    })

    it('should load properly synthetic service', () => {
      // Arrange.
      const syntheticServiceName = 'synthetic_service'
      const syntheticInstance = new SyntheticService()
      container.set(syntheticServiceName, syntheticInstance)

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.yml'))
      const syntheticService = container.get(syntheticServiceName)

      // Assert.
      return assert.instanceOf(syntheticService, SyntheticService)
    })

    it('should load properly service without default export', () => {
      // Arrange.
      const serviceName = 'named'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/named-service.yml'))
      const service = container.get(serviceName)

      // Assert.
      return assert.instanceOf(service, NamedService)
    })
  })

  describe('load multiple imports', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      container.logger = logger
      loader = new YamlFileLoader(container)
    })

    it('should load multiple service files', () => {
      // Arrange.
      const serviceName1 = 'foo'
      const serviceName2 = 'foo_manager'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-imports.yml'))
      const service1 = container.get(serviceName1)
      const service2 = container.get(serviceName2)

      // Assert.
      assert.instanceOf(service1, Foo)

      return assert.instanceOf(service2, FooManager)
    })
  })

  describe('load imports in subfolder', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      container.logger = logger
      loader = new YamlFileLoader(container)
    })

    it('should load multiple service files in subfolder', () => {
      // Arrange.
      const barServiceName = 'bar'
      const bazServiceName = 'baz'
      const configPath = path.join(__dirname,
        '/../../../Resources/config/fake-import-subfolder.yml')

      // Act.
      loader.load(configPath)
      const bar = container.get(barServiceName)
      const baz = container.get(bazServiceName)

      // Assert.
      assert.instanceOf(bar, FooBar)
      return assert.instanceOf(baz, FooBar)
    })
  })

  describe('load with default directory', () => {
    beforeEach(() => {
      container = new ContainerBuilder(false,
        path.join(__dirname, '..', '..', '..'))
      loader = new YamlFileLoader(container)
      container.compile()
    })

    it('should load instance of service properly', () => {
      // Arrange.
      const configPath = path.join(__dirname,
        '/../../../Resources/config/defaultdir.yaml')

      // Act.
      loader.load(configPath)
      const mailer = container.get('mailer')
      const service = container.get('app.service')
      const child = container.get('app.child_class')

      // Assert.
      assert.instanceOf(child, ChildClass)
      assert.instanceOf(service, Service)
      return assert.instanceOf(mailer, Mailer)
    })
  })

  describe('load with main', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new YamlFileLoader(container)
      container.compile()
    })

    it('should load instance of service properly', () => {
      // Arrange.
      const configPath = path.join(
        __dirname,
        '/../../../Resources/config/main.yml'
      )

      // Act.
      loader.load(configPath)
      const one = container.get('one')
      const two = container.get('two')
      const three = container.get('three')

      // Assert.
      assert.instanceOf(one, ClassOne)
      assert.instanceOf(two, ClassTwo)
      return assert.instanceOf(three, ClassThree)
    })
  })

  describe('load with tags', () => {
    beforeEach(() => {
      container = new ContainerBuilder()
      loader = new YamlFileLoader(container)
      container.compile()
    })

    it('should load instance of service with tagged arguments', () => {
      // Arrange.
      const configPath = path.join(
        __dirname,
        '/../../../Resources/config/tagged-arguments.yml'
      )

      // Act.
      loader.load(configPath)
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
