import PackageReference from '../PackageReference'
import ParameterReference from '../ParameterReference'
import Reference from '../Reference'
import TagReference from '../TagReference'
import TaggedReference from '../TaggedReference'
import KeyedReference from '../KeyedReference'
import KeyedGroupReference from '../KeyedGroupReference'

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
      if (argument.slice(0, 12) === '@keyed_group') {
        return this._getKeyedGroupReference(argument)
      }

      if (argument.slice(0, 8) === '@tagged(') {
        return this._getTaggedReference(argument)
      }

      if (argument.slice(0, 6) === '@keyed') {
        return this._getKeyedReference(argument)
      }

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
   * Parses @keyed(group, key) into a KeyedReference.
   * @param {string} argument
   * @returns {KeyedReference}
   * @private
   */
  _getKeyedReference (argument) {
    const inner = argument.slice(7, -1)
    const parts = inner.split(',').map((s) => s.trim())
    return new KeyedReference(parts[0], parts[1])
  }

  /**
   * Parses @keyed_group(group) into a KeyedGroupReference.
   * @param {string} argument
   * @returns {KeyedGroupReference}
   * @private
   */
  _getKeyedGroupReference (argument) {
    const inner = argument.slice(13, -1).trim()
    return new KeyedGroupReference(inner)
  }

  /**
   * Parses @tagged(tag) or @tagged(tag, indexAttribute) into a TaggedReference.
   * The reference-style form follows Symfony tagged-iterator semantics: members
   * are priority ordered and can optionally be projected as an indexed Map.
   *
   * @param {string} argument
   * @returns {TaggedReference}
   * @private
   */
  _getTaggedReference (argument) {
    const inner = argument.slice(8, -1)
    const parts = inner.split(',').map((s) => s.trim())
    return new TaggedReference(parts[0], parts[1] || null)
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

    return new ParameterReference(argument.slice(1, -1))
  }
}
