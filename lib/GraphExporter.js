import Reference from './Reference'

export default class GraphExporter {
  /**
   * @param {import('./ContainerBuilder').default} container
   */
  constructor (container) {
    this._container = container
  }

  /**
   * @param {'mermaid'|'dot'|'json'} format
   * @param {Object} options
   * @returns {string|Object}
   */
  export (format = 'mermaid', options = {}) {
    const graph = this._buildGraph(options)
    switch (format) {
      case 'json':
        return graph
      case 'dot':
        return this._toDot(graph)
      case 'mermaid':
        return this._toMermaid(graph)
      default:
        throw new Error(`Unsupported graph format "${format}"`)
    }
  }

  /**
   * @param {Object} options
   * @returns {{nodes: Array, edges: Array, groups: Array}}
   * @private
   */
  _buildGraph (options) {
    const availableIds = this._getAvailableIds(options)
    const ids = this._applyRootDepthFilter(availableIds, options)
    const nodeIds = [...ids].sort()
    const edges = this._buildEdges(ids)
    const groups = this._buildGroups(nodeIds)
    const nodes = nodeIds.map((id) => this._buildNode(id))

    return {
      nodes,
      edges,
      groups
    }
  }

  /**
   * @param {Object} options
   * @returns {Set<string>}
   * @private
   */
  _getAvailableIds (options) {
    const ids = new Set()
    for (const [id, definition] of this._container.definitions) {
      if (options.excludePrivate && !definition.public) {
        continue
      }

      if (options.tag && !definition.tags.some((tag) => tag.name === options.tag)) {
        continue
      }

      if (options.filter && !this._matchesFilter(id, options.filter)) {
        continue
      }

      ids.add(id)
    }
    return ids
  }

  /**
   * @param {Set<string>} ids
   * @param {Object} options
   * @returns {Set<string>}
   * @private
   */
  _applyRootDepthFilter (ids, options) {
    if (!options.root) {
      return ids
    }

    if (!this._container.definitions.has(options.root)) {
      throw new Error(`Root service "${options.root}" not found`)
    }

    const result = new Set()
    const maxDepth = Number.isInteger(options.depth) ? options.depth : Infinity
    const queue = [{ id: options.root, depth: 0 }]
    const visited = new Set()

    while (queue.length > 0) {
      const current = queue.shift()
      if (visited.has(current.id) || current.depth > maxDepth) {
        continue
      }

      visited.add(current.id)
      if (ids.has(current.id)) {
        result.add(current.id)
      }

      if (current.depth === maxDepth || !this._container.definitions.has(current.id)) {
        continue
      }

      const definition = this._container.definitions.get(current.id)
      for (const dependency of this._collectDependencies(definition)) {
        queue.push({ id: dependency.id, depth: current.depth + 1 })
      }
    }

    return result
  }

  /**
   * @param {Set<string>} ids
   * @returns {Array}
   * @private
   */
  _buildEdges (ids) {
    const seen = new Set()
    const edges = []
    for (const id of ids) {
      const definition = this._container.definitions.get(id)
      if (!definition) {
        continue
      }
      for (const dependency of this._collectDependencies(definition)) {
        if (!ids.has(dependency.id)) {
          continue
        }
        const targetDefinition = this._container.definitions.get(dependency.id)
        const type = dependency.type === 'method'
          ? 'method'
          : (targetDefinition?.lazy ? 'lazy' : 'constructor')
        const key = `${id}:${dependency.id}:${type}`
        if (seen.has(key)) {
          continue
        }
        seen.add(key)
        edges.push({
          from: id,
          to: dependency.id,
          type
        })
      }
    }
    return edges.sort((a, b) => {
      if (a.from !== b.from) {
        return a.from.localeCompare(b.from)
      }
      if (a.to !== b.to) {
        return a.to.localeCompare(b.to)
      }
      return a.type.localeCompare(b.type)
    })
  }

  /**
   * @param {Array<string>} nodeIds
   * @returns {Array}
   * @private
   */
  _buildGroups (nodeIds) {
    const inGraph = new Set(nodeIds)
    const groups = new Map()
    for (const id of nodeIds) {
      const definition = this._container.definitions.get(id)
      if (!definition || !definition.keyedGroup) {
        continue
      }
      if (!groups.has(definition.keyedGroup)) {
        groups.set(definition.keyedGroup, {
          name: definition.keyedGroup,
          type: 'keyed',
          services: [],
          default: null
        })
      }
      const group = groups.get(definition.keyedGroup)
      group.services.push(id)
      if (definition.keyedDefault) {
        group.default = id
      }
    }

    return [...groups.values()]
      .map((group) => {
        group.services = group.services.filter((service) => inGraph.has(service)).sort()
        return group
      })
      .filter((group) => group.services.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * @param {string} id
   * @returns {Object}
   * @private
   */
  _buildNode (id) {
    const definition = this._container.definitions.get(id)
    const node = {
      id,
      class: definition?.Object?.name || null,
      scope: definition?.shared === false ? 'prototype' : 'singleton',
      lazy: Boolean(definition?.lazy)
    }

    if (definition?.keyedGroup && definition?.keyedKey) {
      node.keyed = {
        group: definition.keyedGroup,
        key: definition.keyedKey,
        default: definition.keyedDefault
      }
    }

    return node
  }

  /**
   * @param {Object} graph
   * @returns {string}
   * @private
   */
  _toMermaid (graph) {
    const lines = ['graph TD']
    const aliases = new Map()
    let index = 0

    for (const node of graph.nodes) {
      aliases.set(node.id, `n${index}`)
      index += 1
    }

    for (const group of graph.groups) {
      lines.push(`  subgraph ${this._sanitize(group.name)} [Keyed Group: ${group.name}]`)
      for (const service of group.services) {
        const node = graph.nodes.find((n) => n.id === service)
        lines.push(`    ${aliases.get(service)}[${this._getNodeLabel(node)}]`)
      }
      lines.push('  end')
    }

    const grouped = new Set(graph.groups.flatMap((group) => group.services))
    for (const node of graph.nodes) {
      if (grouped.has(node.id)) {
        continue
      }
      lines.push(`  ${aliases.get(node.id)}[${this._getNodeLabel(node)}]`)
    }

    for (const edge of graph.edges) {
      const link = edge.type === 'constructor' ? '-->' : '-.->'
      lines.push(`  ${aliases.get(edge.from)} ${link} ${aliases.get(edge.to)}`)
    }

    for (const node of graph.nodes) {
      const style = this._getMermaidNodeStyle(node)
      if (style) {
        lines.push(`  style ${aliases.get(node.id)} ${style}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * @param {Object} graph
   * @returns {string}
   * @private
   */
  _toDot (graph) {
    const lines = [
      'digraph DependencyGraph {',
      '  rankdir=LR;',
      '  node [shape=box, style=rounded];'
    ]

    const grouped = new Set()
    for (const group of graph.groups) {
      lines.push(`  subgraph cluster_${this._sanitize(group.name)} {`)
      lines.push(`    label="Keyed: ${group.name}";`)
      for (const service of group.services) {
        grouped.add(service)
        const node = graph.nodes.find((n) => n.id === service)
        const attrs = this._getDotNodeAttributes(node)
        lines.push(`    "${service}"${attrs};`)
      }
      lines.push('  }')
    }

    for (const node of graph.nodes) {
      if (grouped.has(node.id)) {
        continue
      }
      const attrs = this._getDotNodeAttributes(node)
      lines.push(`  "${node.id}"${attrs};`)
    }

    for (const edge of graph.edges) {
      const style = edge.type === 'constructor'
        ? ''
        : (edge.type === 'lazy' ? ' [style=dashed]' : ' [style=dotted]')
      lines.push(`  "${edge.from}" -> "${edge.to}"${style};`)
    }

    lines.push('}')
    return lines.join('\n')
  }

  /**
   * @param {Object} node
   * @returns {string}
   * @private
   */
  _getNodeLabel (node) {
    return node.class || node.id
  }

  /**
   * @param {Object} node
   * @returns {string}
   * @private
   */
  _getMermaidNodeStyle (node) {
    if (node.keyed?.default) {
      return 'fill:#4CAF50,color:#fff'
    }
    if (node.lazy) {
      return 'fill:#FF9800,color:#fff'
    }
    if (node.scope === 'prototype') {
      return 'stroke-dasharray: 5 5'
    }
    return ''
  }

  /**
   * @param {Object} node
   * @returns {string}
   * @private
   */
  _getDotNodeAttributes (node) {
    const attributes = []
    if (node.keyed?.default) {
      attributes.push('style="filled"', 'fillcolor="#4CAF50"')
    } else if (node.lazy) {
      attributes.push('style="filled"', 'fillcolor="orange"')
    } else if (node.scope === 'prototype') {
      attributes.push('style="dashed"')
    }

    return attributes.length > 0 ? ` [${attributes.join(', ')}]` : ''
  }

  /**
   * @param {import('./Definition').default} definition
   * @returns {Array<{id: string, type: string}>}
   * @private
   */
  _collectDependencies (definition) {
    const dependencies = []
    for (const arg of definition.args) {
      this._appendReferenceDependency(arg, dependencies, 'constructor')
    }

    for (const arg of definition.appendArgs) {
      this._appendReferenceDependency(arg, dependencies, 'constructor')
    }

    for (const arg of this._collectParentAppendArgs(definition.parent)) {
      this._appendReferenceDependency(arg, dependencies, 'constructor')
    }

    for (const call of definition.calls) {
      for (const arg of call.args) {
        this._appendReferenceDependency(arg, dependencies, 'method')
      }
    }

    if (definition.factory?.Object instanceof Reference) {
      this._appendReferenceDependency(definition.factory.Object, dependencies, 'constructor')
    }

    return dependencies
  }

  /**
   * @param {*} value
   * @param {Array<{id: string, type: string}>} dependencies
   * @param {'constructor'|'method'} type
   * @private
   */
  _appendReferenceDependency (value, dependencies, type) {
    if (!(value instanceof Reference)) {
      return
    }

    const id = this._resolveAlias(value.id)
    if (this._container.definitions.has(id)) {
      dependencies.push({ id, type })
    }
  }

  /**
   * @param {string|null} definitionParent
   * @returns {Array}
   * @private
   */
  _collectParentAppendArgs (definitionParent) {
    if (!definitionParent || !this._container.definitions.has(definitionParent)) {
      return []
    }

    const parentDefinition = this._container.definitions.get(definitionParent)
    const args = [...parentDefinition.appendArgs]

    if (parentDefinition.parent) {
      args.push(...this._collectParentAppendArgs(parentDefinition.parent))
    }

    return args
  }

  /**
   * @param {string} id
   * @returns {string}
   * @private
   */
  _resolveAlias (id) {
    const definitions = this._container.definitions
    const alias = this._container._alias

    if (!alias || definitions.has(id)) {
      return id
    }

    let resolvedId = id
    const seen = new Set()
    while (!definitions.has(resolvedId) && alias.has(resolvedId)) {
      if (seen.has(resolvedId)) {
        break
      }
      seen.add(resolvedId)
      resolvedId = alias.get(resolvedId)
    }

    return resolvedId
  }

  /**
   * @param {string} id
   * @param {RegExp|string|Function} filter
   * @returns {boolean}
   * @private
   */
  _matchesFilter (id, filter) {
    if (filter instanceof RegExp) {
      return filter.test(id)
    }
    if (typeof filter === 'function') {
      return filter(id)
    }
    if (typeof filter === 'string') {
      return id.includes(filter)
    }
    return true
  }

  /**
   * @param {string} value
   * @returns {string}
   * @private
   */
  _sanitize (value) {
    return value.replace(/[^a-zA-Z0-9_]/g, '_')
  }
}
