import fs from 'fs/promises'
import util from 'util'
import Dumper from './Dumper'

export default class JsDumper extends Dumper {
  async dump () {
    const dataContent = `
module.exports = ${util.inspect(this._content, false, null)}
`
    await fs.writeFile(
      this._serviceFile,
      dataContent,
      { encoding: 'utf8' }
    )
  }
}
