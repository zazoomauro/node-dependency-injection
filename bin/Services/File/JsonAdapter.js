import BaseAdapter from './BaseAdapter'

export default class JsonAdapter extends BaseAdapter {
  /**
   * @return {string}
   */
  static get FORMAT () {
    return 'json'
  }

  /**
   * @return {string}
   */
  get defaultConfiguration () {
    return JSON.stringify(super.defaultConfiguration, null, 2)
  }
}
