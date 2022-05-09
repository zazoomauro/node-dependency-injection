import AbstractFoo from "../Abstract/AbstractFoo";

export default class Foo extends AbstractFoo {
  doIt(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}