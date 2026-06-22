import FileLoader from './FileLoader'
import ConfigurationFileNotFoundException from '../Exception/ConfigurationFileNotFoundException'
import { pathToFileURL } from 'url'

export default class JsFileLoader extends FileLoader {
  /**
   * @param {string|null} file
   */
  async load (file = null) {
    super.filePath = file
    this._container.loggerHelper.info(`Loading JS/JSON file: ${file}`)

    let content

    try {
      const loadedModule = await this._loadModule(this.filePath)
      if (
        loadedModule &&
        (loadedModule.imports !== undefined ||
          loadedModule.parameters !== undefined ||
          loadedModule.services !== undefined)
      ) {
        content = loadedModule
      } else {
        content = loadedModule?.default || loadedModule
      }
    } catch (e) {
      throw new ConfigurationFileNotFoundException(this.filePath)
    }

    await this._parseImports(content.imports)
    await this._parseParameters(content.parameters)
    await this._parseDefinitions(content.services)
  }

  async _loadModule (modulePath) {
    try {
      return require(modulePath)
    } catch (error) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw error
      }
      return import(pathToFileURL(require.resolve(modulePath)).href)
    }
  }
}
