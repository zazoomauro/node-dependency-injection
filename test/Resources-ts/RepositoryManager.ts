export default class RepositoryManager {
  constructor (private readonly _repositories: any) {
  }

  get repositories () {
    return this._repositories
  }
}
