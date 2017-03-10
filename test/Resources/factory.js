import FooBar from './foobar'

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
}
