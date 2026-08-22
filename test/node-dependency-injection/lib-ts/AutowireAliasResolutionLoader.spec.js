import { describe, it } from 'mocha'
import chai from 'chai'
import path from 'path'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import YamlFileLoader from '../../../lib/Loader/YamlFileLoader'

const assert = chai.assert

describe('Autowire alias resolution configuration', () => {
  it('loads autowireAliasResolution from YAML _defaults', async () => {
    const container = new ContainerBuilder()
    const loader = new YamlFileLoader(container)
    const configPath = path.join(
      __dirname,
      '..',
      '..',
      'Resources-ts',
      'config',
      'services-autowire-alias-resolution.yml'
    )

    await loader.load(configPath)

    assert.strictEqual(container.autowire.autowireAliasResolution, 'none')
    assert.isFalse(container.hasAlias('Interface/Strategy'))
  })
})
