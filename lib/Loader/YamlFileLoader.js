import FileLoader from './FileLoader'
import yaml from 'js-yaml'
import fs from 'fs-extra'
import ServiceFileNotFoundException from '../Exception/ServiceFileNotFoundException'

class YamlFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  load (file = null) {
    super._checkFile(file)

    let content

    try {
      content = yaml.safeLoad(fs.readFileSync(this.filePath))
    } catch (e) {
      throw new ServiceFileNotFoundException(this.filePath)
    }

    this._parseImports(content.imports)
    this._parseParameters(content.parameters)
    this._parseDefinitions(content.services)
  }
}

export default YamlFileLoader
