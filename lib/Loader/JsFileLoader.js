import FileLoader from './FileLoader'

class JsFileLoader extends FileLoader {
  load () {
    let content

    try {
      content = require(this.filePath)
    } catch (e) {
      throw new Error('The file ' + this.filePath + ' not exists')
    }

    this.parseDefinitions(content.services)
  }
}

export default JsFileLoader
