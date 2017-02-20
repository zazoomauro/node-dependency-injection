import FileLoader from './FileLoader'
import path from 'path'

class JsFileLoader extends FileLoader {

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
      content = require(fileToLoad)
    } catch (e) {
      throw new Error('The file ' + fileToLoad + ' not exists')
    }

    this._parseImports(content.imports)
    this._parseParameters(content.parameters)
    this._parseDefinitions(content.services)
  }
}

export default JsFileLoader
