import IBar from "../Interface/IBar";
import SomeService from "../Service/SomeService";

export default abstract class AbstractFoo {
  constructor(
    private readonly service: SomeService,
    private readonly someInterface: IBar,
  ) {}

  abstract doIt(): Promise<void>

  async getNumber(): Promise<number> {
    return this.service.number
  }

  async getProcessFromInterface(): Promise<number> {
    return this.someInterface.process()
  }
}
