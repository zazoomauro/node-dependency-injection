import chai from 'chai';
import ContainerBuilder from '../../lib/ContainerBuilder';
import Definition from '../../lib/Definition';
import Reference from '../../lib/Reference';

let assert = chai.assert;

describe('ContainerBuilder', () => {
    let containerBuilder;

    beforeEach(() => {
        containerBuilder = new ContainerBuilder();
    });

    describe('register', () => {
        it('should return a definition instance', function () {
            // Arrange.
            let id = 'foo';
            let className = 'bar';

            // Act.
            let actual = containerBuilder.register(id, className);

            // Assert.
            assert.instanceOf(actual, Definition);
        });
    });

    describe('get', function () {
        it('should throw an exception if the service not exists', function () {
            // Arrange.
            let id = 'service._foo_bar';

            // Act.
            let actual = () => containerBuilder.get(id);

            // Assert.
            assert.throws(actual, Error, 'The service ' + id + ' is not registered');
        });

        it('should return the right service', function () {
            // Arrange.
            let id = 'service.foo';
            class Foo {
            }
            containerBuilder.register(id, Foo);

            // Act.
            let actual = containerBuilder.get(id);

            // Assert.
            assert.instanceOf(actual, Foo);
        });

        it('should return the right service with argument in the constructor', () => {
            // Arrange.
            let id = 'service.foo';
            let param = 'foo bar';
            class Foo {
                constructor(param) {
                    this._param = param
                }

                get param() {
                    return this._param;
                }
            }
            containerBuilder.register(id, Foo).addArgument(param);

            // Act.
            let actual = containerBuilder.get(id);

            // Assert.
            assert.strictEqual(actual.param, param);
        });

        it('should return the right service with reference argument', () => {
            // Arrange.
            let id = 'service.foo';
            let referenceId = 'service.bar';
            class Bar {
            }
            class Foo {
                constructor(bar) {
                    this._bar = bar;
                }

                get bar() {
                    return this._bar;
                }
            }
            containerBuilder.register(referenceId, Bar);
            containerBuilder.register(id, Foo).addArgument(new Reference(referenceId));

            // Act.
            let actual = containerBuilder.get(id);

            // Assert.
            assert.instanceOf(actual.bar, Bar);
        });

        it('should return the right service with reference argument', () => {
            // Arrange.
            let id = 'service.foo';
            let reference1Id = 'service.bar';
            let reference2Id = 'service.foo_bar';
            class FooBar {
            }
            class Bar {
                constructor(fooBar) {
                    this._fooBar = fooBar;
                }

                get fooBar() {
                    return this._fooBar;
                }
            }
            class Foo {
                constructor(bar) {
                    this._bar = bar;
                }

                get bar() {
                    return this._bar;
                }
            }
            containerBuilder.register(reference2Id, FooBar);
            containerBuilder.register(reference1Id, Bar).addArgument(new Reference(reference2Id));
            containerBuilder.register(id, Foo).addArgument(new Reference(reference1Id));

            // Act.
            let actual = containerBuilder.get(id);

            // Assert.
            assert.instanceOf(actual.bar, Bar);
            assert.instanceOf(actual.bar.fooBar, FooBar);
        });
    });
});