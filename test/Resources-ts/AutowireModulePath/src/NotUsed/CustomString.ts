export default class CustomString {
  constructor(value: string) {
    CustomString.ensureIsNotEmpty(value);
  }

  private static ensureIsNotEmpty(value: string): void {
    if (!value) {
      throw new Error('Not must be a string');
    }
  }
}