module.exports = {
  parameters: {
    fooParameter: 'barValue',
    barParameter: ['foo', 'bar'],
    fooProperty: 'fooProperty'
  },
  services: {
    foo: {
      class: './../foo',
      arguments: ['@bar', '%fs', 'foo-bar', '%fooParameter%'],
      tags: [
        { name: 'fooTag' }
      ],
      properties: {
        property: '%fooProperty%'
      }
    },
    bar: {
      class: './../bar',
      calls: [
        { method: 'setFooBar', arguments: ['@foobar'] }
      ],
      tags: [
        { name: 'fooTag' }
      ]
    },
    foobar: { class: './../foobar' },
    f: '@foo'
  }
}
