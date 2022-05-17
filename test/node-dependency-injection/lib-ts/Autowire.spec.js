import { describe, it } from 'mocha'
import chai from 'chai'
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
import FooBarPath from '../../Resources-ts/AutowireModulePath/src/FooBar'
import BarPath from '../../Resources-ts/AutowireModulePath/src/Service/Bar'
import FooPath from '../../Resources-ts/AutowireModulePath/src/Service/Foo'
import NotUsedFooPath from '../../Resources-ts/AutowireModulePath/src/NotUsed/Foo'
import ImplementsOnePath from '../../Resources-ts/AutowireModulePath/src/Service/ImplementsOne'
import ImplementsTwoPath from '../../Resources-ts/AutowireModulePath/src/Service/ImplementsTwo'

const assert = chai.assert

describe('AutowireTS', () => {
    it('should process and return a compiled container with services', async () => {
        // Arrange.
        const dir = path.join(__dirname, '..', '..', 'Resources-ts', 'Autowire', 'src')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)

        // Act.
        autowire.process()
        container.compile()

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

    it('should loading services with autowire and yaml file loader', async () => {
        // Arrange.
        const container = new ContainerBuilder()
        let loader = new YamlFileLoader(container)

        // Act.
        loader.load(
            path.join(
                __dirname,
                '/../../Resources-ts/Autowire/config/services.yaml',
            )
        )

        // Assert
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
        loader.load(
            path.join(
                __dirname,
                '/../../Resources-ts/Autowire/config/services.js',
            )
        )

        // Assert
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
        loader.load(
            path.join(
                __dirname,
                '/../../Resources-ts/Autowire/config/services.json',
            )
        )

        // Assert
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
            'Resources-ts', 
            'AutowireModulePath', 
            'src'
        )
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container)

        // Act.
        autowire.process()
        container.compile()

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

    it('should load with sophisticated path mapping in custom tsconfig.json', async () => {
        // Arrange.
        const dir = path.join(
            __dirname,
            '..',
            '..',
            'Resources-ts',
            'AutowireModulePath',
            'src'
        )
        const tsConfigPath = path.join(process.cwd(), 'tsconfig.json')
        const container = new ContainerBuilder(false, dir)
        const autowire = new Autowire(container, tsConfigPath)

        // Act.
        autowire.process()
        container.compile()

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
})
