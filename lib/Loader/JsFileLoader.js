import FileLoader from './FileLoader'
import ConfigurationFileNotFoundException from '../Exception/ConfigurationFileNotFoundException'

class JsFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  async load (file = null) {
    super.filePath = file

    let content

    try {
      content = require(this.filePath)
    } catch (e) {
      throw new ConfigurationFileNotFoundException(this.filePath)
    }

    await this._parseImports(content.imports)
    await this._parseParameters(content.parameters)
    await this._parseDefinitions(content.services)
  }
}

export default JsFileLoader
