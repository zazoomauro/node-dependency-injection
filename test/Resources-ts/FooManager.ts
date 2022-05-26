export default class FooManager {
  public static fooManagerCalls: number = 0;
  constructor () {
    return FooManager.fooManagerCalls++
  }
}
