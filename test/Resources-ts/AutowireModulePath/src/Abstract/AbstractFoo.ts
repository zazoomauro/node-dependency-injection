import SomeService from "@app/Service/SomeService";

export default abstract class AbstractFoo {
  constructor(
    private readonly service: SomeService,
  ) {}

  abstract doIt(): Promise<void>

  async getNumber(): Promise<number> {
    return this.service.number
  }
}