import FooBar from './Foobar'
import Foo from './Foo'

export default class Factory {
  static getFactoryWithoutArgs (): FooBar {
    return new FooBar('foo_bar')
  }

  static getFactoryWithArgs (value = 'ko'): FooBar|null {
    if (value === 'ok') {
      return new FooBar('foo_bar')
    }

    return null
  }

  static getFactoryWithServiceArg (service: Foo): FooBar|null {
    if (service instanceof Foo) {
      return new FooBar('foo_bar')
    }

    return null
  }
}
