import chai from 'chai';
import JsFileLoader from '../../../lib/Loader/JsFileLoader';
import ContainerBuilder from '../../../lib/ContainerBuilder';
import Foo from '../../Resources/foo';
import Bar from '../../Resources/bar';

let assert = chai.assert;

describe('JsFileLoader', () => {
    let loader;
    let container;

    beforeEach(() => {
        container = new ContainerBuilder();
        loader = new JsFileLoader(container, __dirname + '/../../Resources/fake-services.js');
    });

    describe('load', () => {
        it('should throw an exception if the json file not exists', function () {
            // Arrange.
            let path = 'fake-path.js';
            loader = new JsFileLoader(container, path);

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