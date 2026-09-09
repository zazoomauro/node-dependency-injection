import Strategy from '../Interface/Strategy'

export default class FirstStrategy implements Strategy {
  name(): string {
    return 'first'
  }
}
