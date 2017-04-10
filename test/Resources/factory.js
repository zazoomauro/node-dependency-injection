import FooBar from './foobar'
import Foo from './foo'

export default class Factory {
  static getFactoryWithoutArgs () {
    return new FooBar('foo_bar')
  }

  static getFactoryWithArgs (value = 'ko') {
    if (value === 'ok') {
      return new FooBar('foo_bar')
    }

    return null
  }

  static getFactoryWithServiceArg (service) {
    if (service instanceof Foo) {
      return new FooBar('foo_bar')
    }

    return null
  }
}
