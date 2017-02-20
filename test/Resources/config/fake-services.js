module.exports = {
  parameters: {
    fooParameter: 'barValue',
    barParameter: ['foo', 'bar']
  },
  services: {
    foo: {
      class: './../foo',
      arguments: ['@bar', '%fs-extra', 'foo-bar', '%fooParameter%'],
      tags: [
        {name: 'fooTag'}
      ]
    },
    bar: {
      class: './../bar',
      calls: [
        { method: 'setFooBar', arguments: ['@foobar'] }
      ],
      tags: [
        {name: 'fooTag'}
      ]
    },
    foobar: {class: './../foobar'},
    f: '@foo'
  }
}
