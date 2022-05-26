import fs from 'fs/promises'
import Dumper from './Dumper'

export default class JsonDumper extends Dumper {
  async dump () {
    const dataContent = JSON.stringify(this._content)
    await fs.writeFile(
      this._serviceFile,
      dataContent,
      { encoding: 'utf8' }
    )
  }
}
