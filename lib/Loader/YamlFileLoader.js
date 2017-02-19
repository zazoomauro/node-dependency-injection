import FileLoader from './FileLoader'
import yaml from 'js-yaml'
import fs from 'fs-extra'
import path from 'path'

class YamlFileLoader extends FileLoader {

  /**
   * @param {string|null} file
   */
  load (file = null) {
    let content

    let fileToLoad = this.filePath
    if (file) {
      let directory = path.dirname(this.filePath)
      fileToLoad = path.join(directory, file)
    }

    try {
      content = yaml.safeLoad(fs.readFileSync(fileToLoad))
    } catch (e) {
      throw new Error('The file ' + fileToLoad + ' not exists')
    }

    this._parseImports(content.imports)
    this._parseDefinitions(content.services)
  }
}

export default YamlFileLoader
