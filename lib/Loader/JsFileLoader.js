import FileLoader from './FileLoader';

class JsonFileLoader extends FileLoader {
  load() {
    let content;

    try {
      content = require(this.path);
    } catch (e) {
      throw new Error('The file not exists');
    }

    this.parseDefinitions(content.services);
  }
}

export default JsonFileLoader;