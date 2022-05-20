import FileLoader from './FileLoader'
import yaml from 'js-yaml'
import * as fs from 'fs/promises'
import ServiceFileNotFoundException from '../Exception/ServiceFileNotFoundException'
import ServiceFileNotLoadedException from '../Exception/ServiceFileNotLoadedException'

export default class YamlFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  async load (file = null) {
    super.filePath = file

    let rawContent

    try {
      rawContent = await fs.readFile(this.filePath)
    } catch (e) {
      throw new ServiceFileNotFoundException(this.filePath)
    }

    let content

    try {
      content = await yaml.load(rawContent)
    } catch (e) {
      throw new ServiceFileNotLoadedException(e.message)
    }

    await this._parseImports(content.imports)
    await this._parseParameters(content.parameters)
    await this._parseDefinitions(content.services)
  }
}
