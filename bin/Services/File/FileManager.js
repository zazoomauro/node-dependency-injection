export default class FileManager {
  /**
   * @param {YamlAdapter|JsAdapter|JsonAdapter} adapter
   * @param {fs} fs
   * @param {path} path
   */
  constructor (adapter, fs, path) {
    this._adapter = adapter
    this._fs = fs
    this._path = path
  }

  /**
   * @param {string} dir
   * @param {string} name
   * @return {boolean}
   */
  createConfiguration (dir, name = 'services') {
    const completePath = this._path.format({
      dir: dir,
      base: `${name}.${this._adapter.constructor.FORMAT}`
    })

    try {
      this._fs.writeFileSync(completePath, this._adapter.defaultConfiguration)

      return true
    } catch (e) {
      return false
    }
  }
}
