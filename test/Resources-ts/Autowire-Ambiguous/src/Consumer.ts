import Strategy from './Interface/Strategy'

export default class Consumer {
  constructor(private readonly strategy: Strategy) {}

  selected(): string {
    return this.strategy.name()
  }
}
