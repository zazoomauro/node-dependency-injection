export default class BaseAdapter {
  /**
   * @return {object}
   */
  get defaultConfiguration () {
    return {
      parameters: {
        'some.parameter.foo': 'foo',
        'some.parameter.bar': 'bar'
      },
      imports: [
        { resource: `/path/to/another-file.${this.constructor.FORMAT}` }
      ],
      services: {
        'some.service.key': {
          class: './some/class/path',
          arguments: ['@some.service.key2', '%some.parameter.foo%']
        },
        'some.service.key2': {
          class: './some/class/path2',
          arguments: ['%some.parameter.bar%']
        }
      }
    }
  }
}
