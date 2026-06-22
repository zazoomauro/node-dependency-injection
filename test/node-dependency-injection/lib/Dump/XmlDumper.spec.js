import { describe, it, afterEach } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import fs from 'fs/promises'
import path from 'path'
import XmlDumper from '../../../../lib/Dump/XmlDumper'

const assert = chai.assert
const TMP_FILE = path.join('/tmp', 'test-xml-dumper.xml')

describe('XmlDumper', () => {
  afterEach(async () => {
    try { await fs.unlink(TMP_FILE) } catch (_) {}
  })

  it('should dump and reload an alias entry', async () => {
    const content = {
      services: {
        foo: { class: './../foo', arguments: [] },
        f: '@foo'
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'id="foo"')
    assert.include(raw, 'alias="foo"')
  })

  it('should dump and reload a synthetic service', async () => {
    const content = {
      services: {
        synthetic_service: { synthetic: true }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'synthetic="true"')
  })

  it('should dump and reload lazy, public=false, shared=false', async () => {
    const content = {
      services: {
        lazy_svc: { class: './../foobar', arguments: [], lazy: true },
        private_svc: { class: './../foobar', arguments: [], public: false },
        non_shared_svc: { class: './../foobar', arguments: [], shared: false }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'lazy="true"')
    assert.include(raw, 'public="false"')
    assert.include(raw, 'shared="false"')
  })

  it('should dump and reload deprecated', async () => {
    const content = {
      services: {
        deprecated_svc: {
          class: './../foobar',
          arguments: [],
          deprecated: 'Deprecated service'
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'deprecated="Deprecated service"')
  })

  it('should dump and reload decorates and decoration_priority', async () => {
    const content = {
      services: {
        'app.mailer': { class: './../Mailer', arguments: [] },
        'app.decorating_mailer': {
          class: './../DecoratingMailer',
          arguments: ['@app.decorating_mailer.inner'],
          decorates: 'app.mailer',
          decoration_priority: 3,
          public: false
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'decorates="app.mailer"')
    assert.include(raw, 'decoration-priority="3"')
  })

  it('should dump and reload tags', async () => {
    const content = {
      services: {
        'app.listener': {
          class: './../listener',
          arguments: [],
          tags: [
            { name: 'fooTag' },
            { name: 'listener', attributes: { event: 'postUpdate' } }
          ]
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'name="fooTag"')
    assert.include(raw, 'name="listener"')
    assert.include(raw, 'event="postUpdate"')
  })

  it('should dump and reload method calls', async () => {
    const content = {
      services: {
        bar: {
          class: './../bar',
          arguments: [],
          calls: [
            { method: 'setFooBar', arguments: ['@foobar'] }
          ]
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'method="setFooBar"')
    assert.include(raw, '@foobar')
  })

  it('should dump and reload properties', async () => {
    const content = {
      services: {
        foo: {
          class: './../foo',
          arguments: [],
          properties: { property: '%fooProperty%' }
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'name="property"')
    assert.include(raw, '%fooProperty%')
  })

  it('should dump and reload factory with class path', async () => {
    const content = {
      services: {
        from_factory: {
          arguments: [],
          factory: { class: './../factory', method: 'getFactoryWithoutArgs' }
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'class="./../factory"')
    assert.include(raw, 'method="getFactoryWithoutArgs"')
  })

  it('should dump and reload factory with service reference', async () => {
    const content = {
      services: {
        from_factory_ref: {
          arguments: [],
          factory: { class: '@factory', method: 'getFactoryWithoutArgs' }
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'service="@factory"')
    assert.include(raw, 'method="getFactoryWithoutArgs"')
  })

  it('should dump and reload boolean arguments with type annotation', async () => {
    const content = {
      services: {
        foo: {
          class: './../foo',
          arguments: [true, false, 'normal']
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'type="boolean"')
  })

  it('should dump and reload tagged arguments', async () => {
    const content = {
      services: {
        foo: {
          class: './../foo',
          arguments: ['!tagged fooTag']
        }
      }
    }
    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')
    assert.include(raw, 'type="tagged"')
    assert.include(raw, 'fooTag')
  })

  it('should produce a full round-trip for all supported Definition fields', async () => {
    const content = {
      services: {
        f: '@foo',
        foo: {
          class: './../foo',
          arguments: ['@bar', '%fooParameter%', 'foo-bar', true, '!tagged fooTag'],
          tags: [
            { name: 'fooTag' },
            { name: 'listener', attributes: { event: 'postUpdate' } }
          ],
          properties: { property: '%fooProperty%' }
        },
        bar: {
          class: './../bar',
          arguments: [],
          calls: [
            { method: 'setFooBar', arguments: ['@foobar'] }
          ],
          tags: [{ name: 'fooTag' }]
        },
        foobar: {
          class: './../foobar',
          arguments: [],
          deprecated: 'Deprecated service'
        },
        'lazy.service': {
          class: './../foobar',
          arguments: [],
          lazy: true
        },
        'private_service': {
          class: './../foo',
          arguments: ['@bar'],
          public: false
        },
        'not_shared_service': {
          class: './../Mailer',
          arguments: [],
          shared: false
        },
        'app.mailer': { class: './../Mailer', arguments: [] },
        'app.decorating_mailer': {
          class: './../DecoratingMailer',
          arguments: ['@app.decorating_mailer.inner'],
          decorates: 'app.mailer',
          decoration_priority: 1,
          public: false
        }
      }
    }

    const dumper = new XmlDumper(TMP_FILE, content)
    await dumper.dump()

    const raw = await fs.readFile(TMP_FILE, 'utf8')

    // Verify key fields are present in the output
    assert.include(raw, 'alias="foo"')
    assert.include(raw, 'type="boolean"')
    assert.include(raw, 'type="tagged"')
    assert.include(raw, 'name="fooTag"')
    assert.include(raw, 'event="postUpdate"')
    assert.include(raw, 'method="setFooBar"')
    assert.include(raw, 'name="property"')
    assert.include(raw, 'deprecated="Deprecated service"')
    assert.include(raw, 'lazy="true"')
    assert.include(raw, 'public="false"')
    assert.include(raw, 'shared="false"')
    assert.include(raw, 'decorates="app.mailer"')
    assert.include(raw, 'decoration-priority="1"')
  })
})
