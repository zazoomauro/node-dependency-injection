import FileLoader from './FileLoader'
import yaml from 'js-yaml'
import fs from 'fs-extra'

class YamlFileLoader extends FileLoader {
  load () {
    let content

    try {
      content = yaml.safeLoad(fs.readFileSync(this.filePath))
    } catch (e) {
      throw new Error('The file ' + this.filePath + ' not exists')
    }

    this.parseDefinitions(content.services)
  }
}

export default YamlFileLoader
