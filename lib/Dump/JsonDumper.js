import fs from 'fs/promises'

export default class JsonDumper {
  constructor(serviceFile, content) {
    this._serviceFile = serviceFile
    this._content = content
  }

  async dump() {
    const dataContent = JSON.stringify(this._content)
    await fs.writeFile(
      this._serviceFile, 
      dataContent, 
      { encoding: 'utf8' }
    )
  }
}
