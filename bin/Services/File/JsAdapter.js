import BaseAdapter from './BaseAdapter'
import util from 'util'

export default class JsAdapter extends BaseAdapter {
  /**
   * @return {string}
   */
  static get FORMAT () {
    return 'js'
  }

  /**
   * @return {string}
   */
  get defaultConfiguration () {
    return `
module.exports = ${util.inspect(super.defaultConfiguration, false, null)}    
`
  }
}
