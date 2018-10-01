import FileLoader from './FileLoader'
import yaml from 'js-yaml'
import * as fs from 'fs'
import ServiceFileNotFoundException from '../Exception/ServiceFileNotFoundException'
import ServiceFileNotLoadedException from '../Exception/ServiceFileNotLoadedException'

class YamlFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  load (file = null) {
    super._checkFile(file)

    let rawContent

    try {
      rawContent = fs.readFileSync(this.filePath)
    } catch (e) {
      throw new ServiceFileNotFoundException(this.filePath)
    }

    let content

    try {
      content = yaml.safeLoad(rawContent)
    } catch (e) {
      throw new ServiceFileNotLoadedException(e.message)
    }

    this._parseImports(content.imports)
    this._parseParameters(content.parameters)
    this._parseDefinitions(content.services)
  }
}

export default YamlFileLoader
