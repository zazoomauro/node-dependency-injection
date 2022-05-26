module.exports = {
  parameters: {
    fooParameter: 'barValue',
    barParameter: ['foo', 'bar'],
    fooProperty: 'fooProperty'
  },
  services: {
    foo: {
      class: './../Foo',
      arguments: ['@bar', '%fs', 'foo-bar', '%fooParameter%', '%env(NODE_ENV)%'],
      tags: [
        { name: 'fooTag' }
      ],
      properties: {
        property: '%fooProperty%'
      }
    },
    bar: {
      class: './../Bar',
      calls: [
        { method: 'setFooBar', arguments: ['@foobar'] }
      ],
      tags: [
        { name: 'fooTag' }
      ]
    },
    foobar: { class: './../Foobar' },
    f: '@foo'
  }
}
