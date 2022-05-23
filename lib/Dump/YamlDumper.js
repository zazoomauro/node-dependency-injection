import fs from 'fs/promises'
import yaml from 'js-yaml'
import Dumper from './Dumper'

export default class YamlDumper extends Dumper {
  async dump () {
    const dataContent = yaml.dump(this._content)
    await fs.writeFile(
      this._serviceFile,
      dataContent,
      { encoding: 'utf8' }
    )
  }
}
