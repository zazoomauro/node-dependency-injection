import chai from 'chai';
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader';
import ContainerBuilder from '../../../lib/ContainerBuilder';
import Foo from '../../Resources/foo';
import Bar from '../../Resources/bar';

let assert = chai.assert;

describe('YamlFileLoader', () => {
    let loader;
    let container;

    beforeEach(() => {
        container = new ContainerBuilder();
        loader = new YamlFileLoader(container, __dirname + '/../../Resources/fake-services.yml');
    });

    describe('load', () => {
        it('should throw an exception if the yaml file not exists', function () {
            // Arrange.
            let path = 'fake-path.yml';
            loader = new YamlFileLoader(container, path);

            // Act.
            let actual = () => loader.load();

            // Assert.
            assert.throws(actual, Error, 'The file not exists');
        });

        it('should load a simple container', function () {
            // Arrange.
            let serviceName = 'foo';

            // Act.
            loader.load();
            let service = container.get(serviceName);

            // Assert.
            assert.instanceOf(service, Foo);
            assert.instanceOf(service.bar, Bar);
            assert.strictEqual(service.param, 'foo-bar');
        });
    });
});