import FileLoader from './FileLoader'

class JsFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  load (file = null) {
    if (!file) {
      console.warn('DEPRECATED',
        'The null argument in the load method is deprecated. ' +
        'Please send the file path in this method instead of in the file load constructor',
      )
    } else {
      this.filePath = file
    }

    let content

    try {
      content = require(this.filePath)
    } catch (e) {
      throw new Error(`The file ${this.filePath} not exists`)
    }

    this._parseImports(content.imports)
    this._parseParameters(content.parameters)
    this._parseDefinitions(content.services)
  }
}

export default JsFileLoader
