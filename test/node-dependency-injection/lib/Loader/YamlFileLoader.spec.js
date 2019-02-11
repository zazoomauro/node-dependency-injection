/* global describe, beforeEach, it */

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

let assert = chai.assert

describe('YamlFileLoader', () => {
  let loader
  let loaderSelfReference
  let container
  let containerSelfReference
  let logger = { warn: () => {} }

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
        `The service app.base_class is abstract`)
      assert.instanceOf(childClass, ChildClass)
      assert.instanceOf(childClass.service, Service)
      assert.throw(throwNotAbstractServiceException, Error,
        `The parent service app.failure.base_class is not abstract`)
    })

    it('should throw an exception if the yaml file not exists', () => {
      // Arrange.
      let file = 'fake-filePath.yml'

      // Act.
      let actual = () => loader.load(file)

      // Assert.
      return assert.throw(actual, Error, `Service file ${file} not found`)
    })

    it('should throw an exception if the yaml file had invalid syntax', () => {
      let actual = () => {
        loader.load(
          path.join(__dirname, '/../../../Resources/config/invalid-yaml-syntax.yml')
        )
      }

      return assert.throw(actual, Error, /^Service file could not be loaded\. /)
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
        path.join(__dirname, '/../../../Resources/config/fake-services.yml'))
      container.compile()
      let service = container.get(serviceName)
      let aliasService = container.get(aliasName)
      let taggedServices = container.findTaggedServiceIds(tagName)
      let stringActualParameter = container.getParameter(stringParameterName)
      let arrayActualParameter = container.getParameter(arrayParameterName)
      let fromFactoryWithoutArgs = container.get('from_factory_without_args')
      let fromFactoryWithArgs = container.get('from_factory_with_args')
      let fromFactoryWithReferenceWithoutArgs = container.get(
        'from_factory_with_reference_without_args')
      let fromFactoryWithReferenceWithArgs = container.get(
        'from_factory_with_reference_with_args')
      let fromFactoryWithReferenceWithServiceArg = container.get(
        'from_factory_with_reference_with_service_arg')
      let serviceMissingDependencies = container.get(
        'service_missing_dependencies')
      let serviceWithDependencies = container.get('service_with_dependencies')
      let serviceMissingDependenciesCall = container.get(
        'service_missing_dependencies_call')
      let serviceWithDependenciesCall = container.get(
        'service_with_dependencies_call')
      let fooWithTrue = container.get('foo_with_true')
      let fooWithFalse = container.get('foo_with_false')
      let throwPrivateServiceException = () => container.get('private_service')
      let serviceUsingPrivateService = container.get(
        'service_using_private_service')
      let listener = container.get('app.listener')
      let mailer = container.get('app.mailer')
      let mailerInner = container.get('app.decorating_mailer.inner')
      let serviceWithObjectParameter = container.get(
        'service_with_object_parameter')
      let decorateAppMailer = container.get('decorate.app.mailer')

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
        `The service private_service is private`)
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
      let notSharedServiceName = 'not_shared_service'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.yml'))
      let actual = container.get(notSharedServiceName)
      let expected = container.get(notSharedServiceName)

      // Assert.
      return assert.notStrictEqual(actual, expected)
    })

    it('should load properly synthetic service', () => {
      // Arrange.
      let syntheticServiceName = 'synthetic_service'
      let syntheticInstance = new SyntheticService()
      container.set(syntheticServiceName, syntheticInstance)

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-services.yml'))
      let syntheticService = container.get(syntheticServiceName)

      // Assert.
      return assert.instanceOf(syntheticService, SyntheticService)
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
      let serviceName1 = 'foo'
      let serviceName2 = 'foo_manager'

      // Act.
      loader.load(
        path.join(__dirname, '/../../../Resources/config/fake-imports.yml'))
      let service1 = container.get(serviceName1)
      let service2 = container.get(serviceName2)

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
      let barServiceName = 'bar'
      let bazServiceName = 'baz'
      let configPath = path.join(__dirname,
        '/../../../Resources/config/fake-import-subfolder.yml')

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
