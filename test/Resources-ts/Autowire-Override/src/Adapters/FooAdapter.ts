import Adapter from "../Adapter";

export default class FooAdapter implements Adapter {
  toString(): string {
    return "foo";
  }
}
