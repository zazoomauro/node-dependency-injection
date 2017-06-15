import FileLoader from './FileLoader'
import yaml from 'js-yaml'
import fs from 'fs-extra'

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
      throw new Error(`The file ${this.filePath} not exists`)
    }

    this._parseImports(content.imports)
    this._parseParameters(content.parameters)
    this._parseDefinitions(content.services)
  }
}

export default YamlFileLoader
