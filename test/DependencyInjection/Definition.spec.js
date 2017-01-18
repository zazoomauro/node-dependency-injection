import chai from 'chai';
import Definition from '../../lib/Definition';

let assert = chai.assert;

describe('Definition', () => {
    let definition;

    beforeEach(() => {
        definition = new Definition();
    });

    describe('addArgument', () => {
        it('should add one element to arguments array', () => {
            // Arrange.
            let argument = 'foobar';

            // Act.
            definition.addArgument(argument);

            // Assert.
            assert.lengthOf(definition.arguments, 1);
        });

        it('should add more than one argument to arguments', function () {
            // Arrange.
            let argument1 = 'foobar';
            let argument2 = 'barfoo';

            // Act.
            definition
                .addArgument(argument1)
                .addArgument(argument2);

            // Assert.
            assert.lengthOf(definition.arguments, 2);
        });
    });
});