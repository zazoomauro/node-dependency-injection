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

  /**
   * Derive a stable, human-readable service ID from an absolute file path
   * by making it relative to the given root directory and stripping the extension.
   *
   * Example: `/app/src/Service/Mailer.ts` with rootDirectory `/app/src` → `Service/Mailer`
   *
   * @param {string} absoluteFilePath
   * @param {string} rootDirectory
   * @param {string} extension
   * @returns {string}
   */
  static toReadableId (absoluteFilePath, rootDirectory, extension = '.ts') {
    return absoluteFilePath
      .replace(rootDirectory, '')
      .replace(/^\//, '')
      .replace(extension, '')
  }

  /**
   * Returns true if the given id was produced by the legacy (base64) strategy.
   * A legacy id, when base64-decoded, is a path-like string starting with `__`
   * (because `/` is replaced with `__` during encoding) and contains only
   * path-safe ASCII characters.
   *
   * @param {string} id
   * @returns {boolean}
   */
  static isLegacyId (id) {
    const decoded = Buffer.from(id, 'base64').toString('utf-8')
    return decoded.startsWith('__') && /^[\w/.\-]+$/.test(decoded)
  }
}
