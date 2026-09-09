import Strategy from '../Interface/Strategy'

export default class SecondStrategy implements Strategy {
  name(): string {
    return 'second'
  }
}
