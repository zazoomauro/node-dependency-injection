import Adapter from "../Adapter";

export default class BarAdapter implements Adapter {
  toString(): string {
    return "bar";
  }
}
