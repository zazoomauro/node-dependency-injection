import { describe, it } from 'mocha'
import chai, { config } from 'chai'
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import path from 'path'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import KeyedReference from '../../../lib/KeyedReference'
import KeyedGroupReference from '../../../lib/KeyedGroupReference'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'
import JsFileLoader from '../../../lib/Loader/JsFileLoader'
import JsonFileLoader from '../../../lib/Loader/JsonFileLoader'
import Autowire from '../../../lib/Autowire'
import FooBar from '../../Resources-ts/Autowire/src/FooBar'
import Bar from '../../Resources-ts/Autowire/src/Service/Bar'
import Foo from '../../Resources-ts/Autowire/src/Service/Foo'
import FooTwo from '../../Resources-ts/Autowire/src/Service/FooTwo'
import NotUsedFoo from '../../Resources-ts/Autowire/src/NotUsed/Foo'
import ImplementsOne from '../../Resources-ts/Autowire/src/Service/ImplementsOne'
import ImplementsTwo from '../../Resources-ts/Autowire/src/Service/ImplementsTwo'
import ExcludedService from '../../Resources-ts/Autowire/src/ToExclude/ExcludedService'
import InFolderExcludedService from '../../Resources-ts/Autowire/src/ToExclude/InFolderExclude/InFolderExcludedService'
import FooBarPath from '../../Resources-ts/AutowireModulePath/src/FooBar'
import BarPath from '../../Resources-ts/AutowireModulePath/src/Service/Bar'
import FooPath from '../../Resources-ts/AutowireModulePath/src/Service/Foo'
import NotUsedFooPath from '../../Resources-ts/AutowireModulePath/src/NotUsed/Foo'
import ImplementsOnePath from '../../Resources-ts/AutowireModulePath/src/Service/ImplementsOne'
import ImplementsTwoPath from '../../Resources-ts/AutowireModulePath/src/Service/ImplementsTwo'
import PathExcludedService from '../../Resources-ts/AutowireModulePath/src/ToExclude/ExcludedService'
import PathInFolderExcludedService from '../../Resources-ts/AutowireModulePath/src/ToExclude/InFolderExclude/InFolderExcludedService'
import FooBarAutowireOverride from '../../Resources-ts/Autowire-Override/src/FooBarAutowireOverride'
import AnotherFooBarAutowireOverride from '../../Resources-ts/Autowire-Override/src/AnotherFooBarAutowireOverride'
import PlainParamService from '../../Resources-ts/Autowire/src/Service/PlainParamService'
import PublicReadonlyParamService from '../../Resources-ts/Autowire/src/Service/PublicReadonlyParamService'
import ProtectedReadonlyParamService from '../../Resources-ts/Autowire/src/Service/ProtectedReadonlyParamService'
import PublicParamService from '../../Resources-ts/Autowire/src/Service/PublicParamService'
import ProtectedParamService from '../../Resources-ts/Autowire/src/Service/ProtectedParamService'
import PrivateParamService from '../../Resources-ts/Autowire/src/Service/PrivateParamService'
import ServiceFile from '../../../lib/ServiceFile';
import RootDirectoryNotFound from '../../../lib/Exception/RootDirectoryNotFound';

const assert = chai.assert

describe('AutowireTS', () => {
    const resourcesTsFolder = 'Resources-ts'
    const dumpServicesPath = '/tmp/services'
    const excludedServiceMessage = 'The service ExcludedService is not registered'
    const inFolderExcludedMessage = 'The service InFolderExcludedService is not registered'

    describe("Autowiring override arguments", () => {
        const folder = 'Autowire-Override';

        it("should override arguments be visible after compile container and dump file", async () => {
            // Arrange.
            const configFile = path.join(
                __dirname,
                '..',
                '..',
                resourcesTsFolder,
                folder,
                'config',
                'services-noimports.yaml'
            )
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, folder, 'src')
            const container = new ContainerBuilder(false, dir)
            const loader = new YamlFileLoader(container)
            const autowire = new Autowire(container)
            const dumpPath = `${dumpServicesPath}-override.yaml`
            autowire.serviceFile = new ServiceFile(dumpPath)
            await loader.load(configFile)
            await autowire.process()
            await container.compile()

            const containerFromDump = new ContainerBuilder(false, dir)
            const loaderFromDump = new YamlFileLoader(containerFromDump)

            // Act.
            await loaderFromDump.load(dumpPath)
            
            // Act.
            const actual = containerFromDump.get(FooBarAutowireOverride)
            const actualAnother = containerFromDump.get(AnotherFooBarAutowireOverride)
            
            // Assert.
            assert.equal(actual.getString(), "ci")
            assert.equal(actualAnother.getString(), "foo")
        });
        
        it("should override arguments be visible after compile container", async () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, folder, 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)
            const loader = new YamlFileLoader(container);
            const configFile = path.join(
                __dirname,
                '..',
                '..',
                resourcesTsFolder,
                folder,
                'config',
                'services-noimports.yaml'
            )
            await loader.load(configFile)
            await autowire.process()
            await container.compile()
            
            // Act.
            const actual = container.get(FooBarAutowireOverride)
            const actualAnother = container.get(AnotherFooBarAutowireOverride)
            
            // Assert.
            assert.equal(actual.getString(), "ci")
            assert.equal(actualAnother.getString(), "foo")
        });
    
        it("should not override single class with autowiring if not exists", async () => {
            // Arrange.
            const configFile = path.join(
              __dirname,
              '..',
              '..',
              resourcesTsFolder,
              folder,
              'config',
              'services-not-exists.yaml'
            )
            const cb = new ContainerBuilder()
            const loader = new YamlFileLoader(cb)
            await loader.load(configFile)
            await cb.compile()
        
            // Act.
            const actual = cb.get(FooBarAutowireOverride)
            
            // Assert.
            assert.isUndefined(actual.adapter)
          });
    
        it("should override single class with autowiring", async () => {
            // Arrange.
            const configFile = path.join(
              __dirname,
              '..',
              '..',
              resourcesTsFolder,
              folder,
              'config',
              'services.yaml'
            )
            const cb = new ContainerBuilder()
            const loader = new YamlFileLoader(cb)
            await loader.load(configFile)
            await cb.compile()
        
            // Act.
            const actual = cb.get(FooBarAutowireOverride)
            const actualAnother = cb.get(AnotherFooBarAutowireOverride)
            
            // Assert.
            assert.equal(actual.getString(), "ci")
            assert.equal(actualAnother.getString(), "bar")
          });
    })

    it('should get service file when was properly set', () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        const dumpPath = `${dumpServicesPath}.yaml`
        const serviceFile = new ServiceFile(dumpPath, true)
        autowire.serviceFile = serviceFile

        // Act.
        const actual = autowire.serviceFile

        // Assert.
        assert.strictEqual(actual, serviceFile)
        assert.instanceOf(actual, ServiceFile)
    })

    it('should throw container default dir must be set if was not set', () => {
        // Arrange.
        const container = new ContainerBuilder()

        // Act.
        const actual = () => new Autowire(container)

        // Assert.
        assert.throws(
            actual,
            Error,
            'Container default dir must be set'
        )
    })

    it('should generate a working services file in yaml with absolute path', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        const dumpPath = `${dumpServicesPath}.yaml`
        autowire.serviceFile = new ServiceFile(dumpPath, true)
        await autowire.process()
        await container.compile()
        const containerDump = new ContainerBuilder(false)
        const loader = new YamlFileLoader(containerDump)

        // Act.
        await loader.load(dumpPath)

        // Assert.
        assert.instanceOf(containerDump, ContainerBuilder)
        assert.instanceOf(containerDump.get(FooBar), FooBar)
        assert.instanceOf(containerDump.get(Foo), Foo)
        assert.notInstanceOf(containerDump.get(Foo), NotUsedFoo)
        assert.instanceOf(containerDump.get(Bar), Bar)
        assert.instanceOf(containerDump.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(containerDump.get(FooBar).multiple, ImplementsTwo)
        const valueAbstractGetNumber = await containerDump.get(Foo).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const processInterfaceGetNumber = await containerDump.get(Foo).getProcessFromInterface();
        assert.strictEqual(processInterfaceGetNumber, 10)
        const valueAbstractGetNumberTwo = await containerDump.get(FooTwo).getNumber()
        assert.strictEqual(valueAbstractGetNumberTwo, 20)
        const processInterfaceGetNumberTwo = await containerDump.get(FooTwo).getProcessFromInterface();
        assert.strictEqual(processInterfaceGetNumberTwo, 10)
        const value = await containerDump.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should generate a working services file in yaml with default directory', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        const dumpPath = `${dumpServicesPath}.yaml`
        autowire.serviceFile = new ServiceFile(dumpPath)
        await autowire.process()
        const containerDump = new ContainerBuilder(false, dir)
        const loader = new YamlFileLoader(containerDump)

        // Act.
        await loader.load(dumpPath)

        // Assert.
        assert.instanceOf(containerDump, ContainerBuilder)
        assert.instanceOf(containerDump.get(FooBar), FooBar)
        assert.instanceOf(containerDump.get(Foo), Foo)
        assert.notInstanceOf(containerDump.get(Foo), NotUsedFoo)
        assert.instanceOf(containerDump.get(Bar), Bar)
        assert.instanceOf(containerDump.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(containerDump.get(FooBar).multiple, ImplementsTwo)
        const valueAbstractGetNumber = await containerDump.get(Foo).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const value = await containerDump.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should generate a working services file in json', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        const dumpPath = `${dumpServicesPath}.json`
        autowire.serviceFile = new ServiceFile(dumpPath)
        await autowire.process()
        const containerDump = new ContainerBuilder(false, dir)
        const loader = new JsonFileLoader(containerDump)
        await container.compile()

        // Act.
        await loader.load(dumpPath)

        // Assert.
        assert.instanceOf(containerDump, ContainerBuilder)
        assert.instanceOf(containerDump.get(FooBar), FooBar)
        assert.instanceOf(containerDump.get(Foo), Foo)
        assert.notInstanceOf(containerDump.get(Foo), NotUsedFoo)
        assert.instanceOf(containerDump.get(Bar), Bar)
        assert.instanceOf(containerDump.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(containerDump.get(FooBar).multiple, ImplementsTwo)
        const valueAbstractGetNumber = await containerDump.get(Foo).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const value = await containerDump.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should generate a working services file in js', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        const dumpPath = `${dumpServicesPath}.js`
        autowire.serviceFile = new ServiceFile(dumpPath)
        await autowire.process()
        const containerDump = new ContainerBuilder(false, dir)
        const loader = new JsFileLoader(containerDump)
        await container.compile()

        // Act.
        await loader.load(dumpPath)

        // Assert.
        assert.instanceOf(containerDump, ContainerBuilder)
        assert.instanceOf(containerDump.get(FooBar), FooBar)
        assert.instanceOf(containerDump.get(Foo), Foo)
        assert.notInstanceOf(containerDump.get(Foo), NotUsedFoo)
        assert.instanceOf(containerDump.get(Bar), Bar)
        assert.instanceOf(containerDump.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(containerDump.get(FooBar).multiple, ImplementsTwo)
        const valueAbstractGetNumber = await containerDump.get(Foo).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const value = await containerDump.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })


    it('should not return an exluded service from an excluded dir', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        autowire.addExclude('/ToExclude')
        await autowire.process()
        await container.compile()
        
        // Act.
        const actual = () => container.get(ExcludedService)

        // Assert.
        assert.throw(
            actual, 
            Error,
            excludedServiceMessage
        )
    })

    it('should not return an in folder exluded service from an excluded dir', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        autowire.addExclude('ToExclude')
        await autowire.process()
        await container.compile()

        // Act.
        const actual = () => container.get(InFolderExcludedService)

        // Assert.
        assert.throw(actual, Error,
            inFolderExcludedMessage)
    })

    it('should process and return a compiled container with services', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)

        // Act.
        await autowire.process()
        await container.compile()

        // Assert.
        assert.instanceOf(autowire.container, ContainerBuilder)
        assert.instanceOf(container.get(FooBar), FooBar)
        assert.instanceOf(container.get(Foo), Foo)
        assert.notInstanceOf(container.get(Foo), NotUsedFoo)
        assert.instanceOf(container.get(Bar), Bar)
        assert.instanceOf(container.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(container.get(FooBar).multiple, ImplementsTwo)
        const valueAbstractGetNumber = await container.get(Foo).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const processGetNumber = await container.get(Foo).getProcessFromInterface()
        assert.strictEqual(processGetNumber, 10)
        const valueAbstractGetNumberTwo = await container.get(FooTwo).getNumber()
        assert.strictEqual(valueAbstractGetNumberTwo, 20)
        const processGetNumberTwo = await container.get(FooTwo).getProcessFromInterface()
        assert.strictEqual(processGetNumberTwo, 10)
        const value = await container.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
        const plainParamService = container.get(PlainParamService)
        assert.instanceOf(plainParamService, PlainParamService)
        const plainValue = await plainParamService.callBarProcessMethod()
        assert.strictEqual(plainValue, 10)
        assert.strictEqual(await container.get(PublicReadonlyParamService).callBarProcessMethod(), 10)
        assert.strictEqual(await container.get(ProtectedReadonlyParamService).callBarProcessMethod(), 10)
        assert.strictEqual(await container.get(PublicParamService).callBarProcessMethod(), 10)
        assert.strictEqual(await container.get(ProtectedParamService).callBarProcessMethod(), 10)
        assert.strictEqual(await container.get(PrivateParamService).callBarProcessMethod(), 10)
    })

    it(
        'should load services with autowire and absolute root dir on autowire',
        async () => {
            // Arrange.
            const container = new ContainerBuilder()
            let loader = new YamlFileLoader(container)
            
            // Act.
            const actual = loader.load(
                path.join(
                    __dirname,
                    '/../../Resources-ts/Autowire/config/services-absolute-root-dir.yaml',
                )
            )

            // Assert.
            assert.isRejected(actual, RootDirectoryNotFound)
        }
    )

    it('should loading services with autowire and yaml file loader', async () => {
        // Arrange.
        const container = new ContainerBuilder()
        let loader = new YamlFileLoader(container)

        // Act.
        await loader.load(
            path.join(
                __dirname,
                '/../../Resources-ts/Autowire/config/services.yaml',
            )
        )

        // Assert
        assert.throw(
            () => container.get(InFolderExcludedService),
            Error,
            inFolderExcludedMessage
        )
        assert.throw(
            () => container.get(ExcludedService),
            Error,
            excludedServiceMessage
        )
        assert.instanceOf(container.get(FooBar), FooBar)
        assert.instanceOf(container.get(Foo), Foo)
        assert.notInstanceOf(container.get(Foo), NotUsedFoo)
        assert.instanceOf(container.get(Bar), Bar)
        assert.instanceOf(container.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(container.get(FooBar).multiple, ImplementsTwo)
        const value = await container.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should loading services with autowire and js file loader', async () => {
        // Arrange.
        const container = new ContainerBuilder()
        let loader = new JsFileLoader(container)

        // Act.
        await loader.load(
            path.join(
                __dirname,
                '/../../Resources-ts/Autowire/config/services.js',
            )
        )

        // Assert
        assert.throw(
            () => container.get(InFolderExcludedService),
            Error,
            inFolderExcludedMessage
        )
        assert.throw(
            () => container.get(ExcludedService),
            Error,
            excludedServiceMessage
        )
        assert.instanceOf(container.get(FooBar), FooBar)
        assert.instanceOf(container.get(Foo), Foo)
        assert.notInstanceOf(container.get(Foo), NotUsedFoo)
        assert.instanceOf(container.get(Bar), Bar)
        assert.instanceOf(container.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(container.get(FooBar).multiple, ImplementsTwo)
        const value = await container.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should loading services with autowire and json file loader', async () => {
        // Arrange.
        const container = new ContainerBuilder()
        let loader = new JsonFileLoader(container)

        // Act.
        await loader.load(
            path.join(
                __dirname,
                '/../../Resources-ts/Autowire/config/services.json',
            )
        )

        // Assert
        assert.throw(
            () => container.get(InFolderExcludedService),
            Error,
            inFolderExcludedMessage
        )
        assert.throw(
            () => container.get(ExcludedService),
            Error,
            excludedServiceMessage
        )
        assert.instanceOf(container.get(FooBar), FooBar)
        assert.instanceOf(container.get(Foo), Foo)
        assert.notInstanceOf(container.get(Foo), NotUsedFoo)
        assert.instanceOf(container.get(Bar), Bar)
        assert.instanceOf(container.get(FooBar).multiple, ImplementsOne)
        assert.notInstanceOf(container.get(FooBar).multiple, ImplementsTwo)
        const value = await container.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should load with sophisticated path mapping', async () => {
        // Arrange.
        const dir = path.join(
            __dirname, 
            '..', 
            '..', 
            resourcesTsFolder, 
            'AutowireModulePath', 
            'src'
        )
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)
        autowire.addExclude('NotUsed')

        // Act.
        await autowire.process()
        await container.compile()

        // Assert.
        assert.instanceOf(autowire.container, ContainerBuilder)
        assert.instanceOf(container.get(FooBarPath), FooBarPath)
        assert.instanceOf(container.get(FooPath), FooPath)
        assert.notInstanceOf(container.get(FooPath), NotUsedFooPath)
        assert.instanceOf(container.get(BarPath), BarPath)
        assert.instanceOf(container.get(FooBarPath).multiple, ImplementsOnePath)
        assert.notInstanceOf(container.get(FooBarPath).multiple, ImplementsTwoPath)
        const valueAbstractGetNumber = await container.get(FooPath).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const value = await container.get(FooBarPath).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should load in not existing tsconfig.json', async () => {
        // Arrange.
        const dir = path.join(
            __dirname,
            '..',
            '..',
            resourcesTsFolder,
            'AutowireModulePath',
            'src'
        )
        const tsConfigPath = path.join(process.cwd(), 'tsconfigs.json')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container, tsConfigPath)
        autowire.addExclude('ToExclude')
        autowire.addExclude('NotUsed')

        // Act.
        await autowire.process()
        await container.compile()

        // Assert.
        assert.throw(
            () => container.get(PathInFolderExcludedService),
            Error,
            inFolderExcludedMessage
        )
        assert.throw(
            () => container.get(PathExcludedService),
            Error,
            excludedServiceMessage
        )
    })

    it('should load with sophisticated path mapping in custom tsconfig.json', async () => {
        // Arrange.
        const dir = path.join(
            __dirname,
            '..',
            '..',
            resourcesTsFolder,
            'AutowireModulePath',
            'src'
        )
        const tsConfigPath = path.join(process.cwd(), 'tsconfig.json')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container, tsConfigPath)
        autowire.addExclude('ToExclude')
        autowire.addExclude('NotUsed')

        // Act.
        await autowire.process()
        await container.compile()

        // Assert.
        assert.throw(
            () => container.get(PathInFolderExcludedService),
            Error,
            inFolderExcludedMessage
        )
        assert.throw(
            () => container.get(PathExcludedService),
            Error,
            excludedServiceMessage
        )
        assert.instanceOf(autowire.container, ContainerBuilder)
        assert.instanceOf(container.get(FooBarPath), FooBarPath)
        assert.instanceOf(container.get(FooPath), FooPath)
        assert.notInstanceOf(container.get(FooPath), NotUsedFooPath)
        assert.instanceOf(container.get(BarPath), BarPath)
        assert.instanceOf(container.get(FooBarPath).multiple, ImplementsOnePath)
        assert.notInstanceOf(container.get(FooBarPath).multiple, ImplementsTwoPath)
        const valueAbstractGetNumber = await container.get(FooPath).getNumber()
        assert.strictEqual(valueAbstractGetNumber, 20)
        const value = await container.get(FooBarPath).callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    describe('readable ID strategy', () => {
        it('should default to legacy ID strategy', () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)

            // Act.
            const autowire = new Autowire(container)

            // Assert.
            assert.strictEqual(autowire.idStrategy, 'legacy')
        })

        it('should allow setting idStrategy to readable', () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)

            // Act.
            autowire.idStrategy = 'readable'

            // Assert.
            assert.strictEqual(autowire.idStrategy, 'readable')
        })

        it('should throw on invalid idStrategy', () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)

            // Act.
            const actual = () => { autowire.idStrategy = 'invalid' }

            // Assert.
            assert.throws(actual, Error, 'Invalid autowire ID strategy')
        })

        it('should register services with human-readable IDs relative to defaultDir', async () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)
            autowire.idStrategy = 'readable'

            // Act.
            await autowire.process()
            await container.compile()

            // Assert: service definitions are stored with readable IDs
            assert.isTrue(container.hasDefinition('FooBar'))
            assert.isTrue(container.hasDefinition('Service/Bar'))
            assert.isTrue(container.hasDefinition('Service/Foo'))
        })

        it('should resolve services by class with readable strategy', async () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)
            autowire.idStrategy = 'readable'

            // Act.
            await autowire.process()
            await container.compile()

            // Assert.
            assert.instanceOf(container.get(FooBar), FooBar)
            assert.instanceOf(container.get(Foo), Foo)
            assert.instanceOf(container.get(Bar), Bar)
            assert.instanceOf(container.get(FooBar).multiple, ImplementsOne)
            assert.notInstanceOf(container.get(FooBar).multiple, ImplementsTwo)
            const value = await container.get(FooBar).callBarProcessMethod()
            assert.strictEqual(value, 10)
        })

        it('should also register legacy aliases for backward compatibility', async () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)
            autowire.idStrategy = 'readable'

            // Act.
            await autowire.process()
            await container.compile()

            // Assert: a legacy alias resolves to the same service instance
            const byClass = container.get(Bar)
            const byReadableId = container.get('Service/Bar')
            assert.instanceOf(byClass, Bar)
            assert.instanceOf(byReadableId, Bar)
        })

        it('should generate a working services file in yaml with readable strategy', async () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)
            autowire.idStrategy = 'readable'
            const dumpPath = `${dumpServicesPath}-readable.yaml`
            autowire.serviceFile = new ServiceFile(dumpPath)
            await autowire.process()
            const containerDump = new ContainerBuilder(false, dir)
            const loader = new YamlFileLoader(containerDump)

            // Act.
            await container.compile()
            await loader.load(dumpPath)

            // Assert.
            assert.instanceOf(containerDump.get(FooBar), FooBar)
            assert.instanceOf(containerDump.get(Foo), Foo)
            assert.instanceOf(containerDump.get(Bar), Bar)
            assert.instanceOf(containerDump.get(FooBar).multiple, ImplementsOne)
            assert.notInstanceOf(containerDump.get(FooBar).multiple, ImplementsTwo)
            const value = await containerDump.get(FooBar).callBarProcessMethod()
            assert.strictEqual(value, 10)
        })

        it('should generate a working services file in yaml with readable strategy and absolute path', async () => {
            // Arrange.
            const dir = path.join(__dirname, '..', '..', resourcesTsFolder, 'Autowire', 'src')
            const container = new ContainerBuilder(false, dir)
            const autowire = new Autowire(container)
            autowire.idStrategy = 'readable'
            const dumpPath = `${dumpServicesPath}-readable-abs.yaml`
            autowire.serviceFile = new ServiceFile(dumpPath, true)
            await autowire.process()
            const containerDump = new ContainerBuilder(false)
            const loader = new YamlFileLoader(containerDump)

            // Act.
            await container.compile()
            await loader.load(dumpPath)

            // Assert.
            assert.instanceOf(containerDump.get(FooBar), FooBar)
            assert.instanceOf(containerDump.get(Foo), Foo)
            assert.instanceOf(containerDump.get(Bar), Bar)
            const value = await containerDump.get(FooBar).callBarProcessMethod()
            assert.strictEqual(value, 10)
        })
    })
})
import BindService from '../../Resources-ts/Autowire/src/Service/BindService'

describe('AutowireTS - Bind', () => {
    const resourcesTsFolder = 'Resources-ts'
    const autowireFolder = 'Autowire'
    const dir = path.join(__dirname, '..', '..', resourcesTsFolder, autowireFolder, 'src')

    it('should inject a bound scalar argument by parameter name (programmatic)', async () => {
        // Arrange.
        const container = new ContainerBuilder(false, dir)
        container.addBind('adminEmail', 'manager@example.com')
        const autowire = new Autowire(container)

        // Act.
        await autowire.process()
        await container.compile()
        const service = container.get(BindService)

        // Assert.
        assert.instanceOf(service, BindService)
        assert.strictEqual(service.getAdminEmail(), 'manager@example.com')
        const value = await service.callBarProcessMethod()
        assert.strictEqual(value, 10)
    })

    it('should inject a bound scalar argument via YAML _defaults.bind', async () => {
        // Arrange.
        const configFile = path.join(
            __dirname, '..', '..', resourcesTsFolder, autowireFolder, 'config', 'services-bind.yaml'
        )
        const container = new ContainerBuilder(false, dir)
        const loader = new YamlFileLoader(container)

        // Act.
        await loader.load(configFile)
        await container.compile()
        const service = container.get(BindService)

        // Assert.
        assert.instanceOf(service, BindService)
        assert.strictEqual(service.getAdminEmail(), 'manager@example.com')
    })

    it('should expose binds via container.binds getter', () => {
        // Arrange.
        const container = new ContainerBuilder()
        container.addBind('someParam', 'someValue')

        // Assert.
        assert.strictEqual(container.binds.get('someParam'), 'someValue')
    })
})
import KeyedCheckoutService from '../../Resources-ts/Autowire-Keyed/src/Service/KeyedCheckoutService'
import KeyedPaymentRouterService from '../../Resources-ts/Autowire-Keyed/src/Service/KeyedPaymentRouterService'
import StripePaymentService from '../../Resources-ts/Autowire-Keyed/src/Service/StripePaymentService'
import PaypalPaymentService from '../../Resources-ts/Autowire-Keyed/src/Service/PaypalPaymentService'

describe('AutowireTS - Keyed Services', () => {
    const resourcesTsFolder = 'Resources-ts'
    const autowireKeyedFolder = 'Autowire-Keyed'
    const dir = path.join(__dirname, '..', '..', resourcesTsFolder, autowireKeyedFolder, 'src')

    it('should inject a specific keyed service via KeyedReference bind (typed parameter)', async () => {
        // Arrange.
        const container = new ContainerBuilder(false, dir)
        container.registerKeyed('payment', 'stripe', StripePaymentService)
        container.registerKeyed('payment', 'paypal', PaypalPaymentService)
        container.addBind('payment', new KeyedReference('payment', 'stripe'))
        const autowire = new Autowire(container)

        // Act.
        await autowire.process()
        await container.compile()
        const service = container.get(KeyedCheckoutService)

        // Assert.
        assert.instanceOf(service, KeyedCheckoutService)
        assert.strictEqual(service.processPayment(100), 'stripe:100')
    })

    it('should inject paypal keyed service via KeyedReference bind when key changes', async () => {
        // Arrange.
        const container = new ContainerBuilder(false, dir)
        container.registerKeyed('payment', 'stripe', StripePaymentService)
        container.registerKeyed('payment', 'paypal', PaypalPaymentService)
        container.addBind('payment', new KeyedReference('payment', 'paypal'))
        const autowire = new Autowire(container)

        // Act.
        await autowire.process()
        await container.compile()
        const service = container.get(KeyedCheckoutService)

        // Assert.
        assert.instanceOf(service, KeyedCheckoutService)
        assert.strictEqual(service.processPayment(50), 'paypal:50')
    })

    it('should inject the full keyed group via KeyedGroupReference bind (Map-typed parameter)', async () => {
        // Arrange.
        const container = new ContainerBuilder(false, dir)
        container.registerKeyed('payment', 'stripe', StripePaymentService)
        container.registerKeyed('payment', 'paypal', PaypalPaymentService)
        container.addBind('payments', new KeyedGroupReference('payment'))
        const autowire = new Autowire(container)

        // Act.
        await autowire.process()
        await container.compile()
        const router = container.get(KeyedPaymentRouterService)

        // Assert.
        assert.instanceOf(router, KeyedPaymentRouterService)
        assert.strictEqual(router.route('stripe', 200), 'stripe:200')
        assert.strictEqual(router.route('paypal', 75), 'paypal:75')
    })
})