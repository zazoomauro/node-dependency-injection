export default class AutowireIdentifier {
  /**
   * @param {string} readableId
   * @returns {string}
   */
  static encode (readableId) {
    return Buffer.from(readableId, 'utf-8').toString('base64')
  }

  /**
   * @param {string} notReadableId
   * @returns {string}
   */
  static decode (notReadableId) {
    return Buffer.from(notReadableId, 'base64').toString('utf-8')
  }
}
