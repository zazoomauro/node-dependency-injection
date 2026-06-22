import { describe, it, beforeEach } from 'mocha'
import chai from 'chai'
import ContainerBuilder from '../../../lib/ContainerBuilder'
import GraphExporter from '../../../lib/GraphExporter'
import Reference from '../../../lib/Reference'

const assert = chai.assert

describe('GraphExporter', () => {
  let container
  let exporter

  beforeEach(() => {
    container = new ContainerBuilder()
    exporter = new GraphExporter(container)
  })

  it('should throw on unsupported formats', () => {
    assert.throw(
      () => exporter.export('xml'),
      Error,
      'Unsupported graph format "xml"'
    )
  })

  it('should throw when root service does not exist', () => {
    assert.throw(
      () => exporter.export('json', { root: 'missing.service' }),
      Error,
      'Root service "missing.service" not found'
    )
  })

  it('should include dependencies from parent append args and factory aliases', () => {
    class GrandParentDependency {}
    class ParentDependency {}
    class FactoryDependency {}
    class GrandParentService {}
    class ParentService {}
    class ChildService {}

    container.register('dep.grand', GrandParentDependency)
    container.register('dep.parent', ParentDependency)
    container.register('factory.service', FactoryDependency)

    container.register('service.grand', GrandParentService)
      .addArgument(new Reference('dep.grand'), true)

    const parent = container.register('service.parent', ParentService)
    parent.parent = 'service.grand'
    parent.addArgument(new Reference('dep.parent'), true)

    const child = container.register('service.child', ChildService)
    child.parent = 'service.parent'
    child.setFactory(new Reference('factory.alias'), 'create')

    container.setAlias('factory.alias', 'factory.service')

    const graph = exporter.export('json')

    assert.deepInclude(graph.edges, {
      from: 'service.child',
      to: 'dep.parent',
      type: 'constructor'
    })
    assert.deepInclude(graph.edges, {
      from: 'service.child',
      to: 'dep.grand',
      type: 'constructor'
    })
    assert.deepInclude(graph.edges, {
      from: 'service.child',
      to: 'factory.service',
      type: 'constructor'
    })
  })

  it('should support string and function filters', () => {
    class AlphaService {}
    class BetaService {}

    container.register('alpha.service', AlphaService)
    container.register('beta.service', BetaService)

    const byString = exporter.export('json', { filter: 'alpha' })
    assert.deepEqual(byString.nodes.map((node) => node.id), ['alpha.service'])

    const byFunction = exporter.export('json', {
      filter: (id) => id.startsWith('beta')
    })
    assert.deepEqual(byFunction.nodes.map((node) => node.id), ['beta.service'])
  })
})
