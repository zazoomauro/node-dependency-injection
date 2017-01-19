import path from 'path';
import Reference from './../Reference';
import PackageReference from './../PackageReference';

class FileLoader {

  /**
   * @param {ContainerBuilder} container
   * @param {string} filePath
   */
  constructor(container, filePath) {
    this._container = container;
    this._filePath = filePath;
  }

  /**
   * @returns {ContainerBuilder}
   */
  get container() {
    return this._container;
  }

  /**
   * @returns {string}
   */
  get filePath() {
    return this._filePath;
  }

  /**
   * @param {Array<*>} services
   */
  parseDefinitions(services) {
    for (let i in  services) {
      if (services.hasOwnProperty(i)) {
        let className = this.requireClassNameFromPath(services[i].class);
        let definition = this.container.register(i, className);
        let args = (services[i].arguments) ? services[i].arguments : [];

        for (let argument of args) {
          if (argument.includes('@', 0)) {
            definition.addArgument(new Reference(argument.slice(1)));
          } else if (argument.includes('%', 0)) {
            definition.addArgument(new PackageReference(argument.slice(1)));
          } else {
            definition.addArgument(argument);
          }
        }
      }
    }
  }

  /**
   * @param {Object|string} classObject
   * @returns {*}
   */
  requireClassNameFromPath(classObject) {
    let fromDirectory = path.dirname(this.filePath);
    let filePath;

    if (typeof classObject === 'object') {
      filePath = fromDirectory + path.sep + classObject.file.replace(/^.\//, '');

      return require(filePath)[classObject.name];
    }

    filePath = fromDirectory + path.sep + classObject.replace(/^.\//, '');

    return require(filePath).default;
  }
}

export default FileLoader;