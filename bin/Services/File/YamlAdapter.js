import BaseAdapter from './BaseAdapter'

export default class YamlAdapter extends BaseAdapter {
  /**
   * @param {js-yaml} yaml
   */
  constructor (yaml) {
    super()
    this._yaml = yaml
  }

  /**
   * @return {string}
   */
  static get FORMAT () {
    return 'yaml'
  }

  /**
   * @return {string}
   */
  get defaultConfiguration () {
    return this._yaml.dump(super.defaultConfiguration)
  }
}
