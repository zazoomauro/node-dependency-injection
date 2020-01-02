export default class RepositoryManager {
  constructor (repositories) {
    this._repositories = repositories
  }

  get repositories () {
    return this._repositories
  }
}
