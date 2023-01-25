import PackageReference from '../PackageReference'
import Reference from '../Reference'
import TagReference from '../TagReference'

export default class Argument {
  /**
   * @param {ContainerBuilder} container
   */
  constructor (
    container
  ) {
    this._container = container
  }

  /**
   * @param {string} argument
   * @returns {string}
   */
  parse (argument) {
    if (
      typeof argument !== 'boolean' &&
      argument.slice(0, 1) === '@'
    ) {
      const referenceId = this._getReferenceIdFromArgument(argument)
      const referenceNullable = argument.slice(1, 2) === '?'
      return new Reference(
        referenceId,
        referenceNullable
      )
    }

    if (
      typeof argument !== 'boolean' &&
      argument.slice(0, 1) === '%') {
      return this._getArgumentParameter(argument)
    }

    if (
      typeof argument !== 'boolean' &&
      argument.slice(0, 7) === '!tagged') {
      return new TagReference(argument.slice(8))
    }

    return argument
  }

  /**
   * @param {string} argument
   * @returns {string}
   *
   * @private
   */
  _getReferenceIdFromArgument (argument) {
    return (argument.slice(1, 2) === '?')
      ? argument.slice(2)
      : argument.slice(1)
  }

  /**
   * @param {string} argument
   * @returns {*}
   *
   * @private
   */
  _getArgumentParameter (argument) {
    if (
      argument.slice(-1) !== '%'
    ) {
      return new PackageReference(argument.slice(1))
    }

    if (
      argument.slice(-1) === '%' &&
      argument.slice(1, 4) === 'env'
    ) {
      return process.env[argument.slice(5, -2)]
    }

    return this._container.getParameter(argument.slice(1, -1))
  }
}
