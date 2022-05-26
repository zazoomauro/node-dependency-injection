import { describe, it } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import path from 'path'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'
import JsFileLoader from '../../../lib/Loader/JsFileLoader'
import JsonFileLoader from '../../../lib/Loader/JsonFileLoader'
import Autowire from '../../../lib/Autowire'
import FooBar from '../../Resources-ts/Autowire/src/FooBar'
import Bar from '../../Resources-ts/Autowire/src/Service/Bar'
import Foo from '../../Resources-ts/Autowire/src/Service/Foo'
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
import ServiceFile from '../../../lib/ServiceFile';
import RootDirectoryNotFound from '../../../lib/Exception/RootDirectoryNotFound';

const assert = chai.assert

describe('AutowireTS', () => {
    const resourcesTsFolder = 'Resources-ts'
    const dumpServicesPath = '/tmp/services'
    const excludedServiceMessage = 'The service ExcludedService is not registered'
    const inFolderExcludedMessage = 'The service InFolderExcludedService is not registered'

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
        const value = await container.get(FooBar).callBarProcessMethod()
        assert.strictEqual(value, 10)
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
})
