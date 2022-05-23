import fs from 'fs/promises'
import util from 'util'

export default class JsDumper {
  constructor(serviceFile, content) {
    this._serviceFile = serviceFile
    this._content = content
  }

  async dump() {
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
