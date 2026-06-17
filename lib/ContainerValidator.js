import Reference from './Reference'
import TagReference from './TagReference'
import ParameterReference from './ParameterReference'
import ValidationResult from './ValidationResult'

export default class ContainerValidator {
  /**
   * @param {import('./ContainerBuilder').default} container
   */
  constructor (container) {
    this._container = container
  }

  /**
   * @returns {ValidationResult}
   */
  validate () {
    const result = new ValidationResult()
    result.serviceCount = this._container.definitions.size

    this._checkMissingDependencies(result)
    this._checkCircularDependencies(result)
    this._checkUnresolvedParameters(result)
    this._checkUnusedNullableFallbacks(result)
    this._checkDeprecatedServicesInUse(result)
    this._checkOrphanTaggedServices(result)
    this._checkKeyedGroupsWithNoDefault(result)

    return result
  }

  // ─── Check 1: Missing dependencies ────────────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkMissingDependencies (result) {
    for (const [id, definition] of this._container.definitions) {
      if (definition.abstract || definition.synthetic) {
        continue
      }
      const allArgs = this._collectAllArgs(definition)
      for (const arg of allArgs) {
        if (arg instanceof Reference && !arg.nullable) {
          const refId = arg.id
          if (!this._serviceExists(refId)) {
            result.addError(
              'missing_dependency',
              id,
              `@${refId}`,
              `Service '${id}' references undefined service '@${refId}'`
            )
          }
        }
      }
    }
  }

  // ─── Check 2: Circular dependencies ───────────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkCircularDependencies (result) {
    const definitions = this._container.definitions
    const visited = new Set()
    const reported = new Set()

    for (const id of definitions.keys()) {
      if (visited.has(id)) {
        continue
      }
      const cycle = this._detectCycle(id, [], new Set(), definitions)
      if (cycle) {
        const cycleKey = cycle.join(' → ')
        if (!reported.has(cycleKey)) {
          reported.add(cycleKey)
          result.addError(
            'circular_dependency',
            cycle[0],
            cycleKey,
            `Circular dependency detected: ${cycleKey}`
          )
        }
      }
      visited.add(id)
    }
  }

  /**
   * @param {string} id
   * @param {string[]} path
   * @param {Set<string>} inStack
   * @param {Map} definitions
   * @returns {string[]|null}
   * @private
   */
  _detectCycle (id, path, inStack, definitions) {
    if (inStack.has(id)) {
      const cycleStart = path.indexOf(id)
      return [...path.slice(cycleStart), id]
    }

    if (!definitions.has(id)) {
      return null
    }

    inStack.add(id)
    path.push(id)

    const definition = definitions.get(id)
    const deps = this._getDirectServiceDeps(definition)

    for (const depId of deps) {
      const cycle = this._detectCycle(depId, path, inStack, definitions)
      if (cycle) {
        return cycle
      }
    }

    path.pop()
    inStack.delete(id)

    return null
  }

  /**
   * @param {import('./Definition').default} definition
   * @returns {string[]}
   * @private
   */
  _getDirectServiceDeps (definition) {
    const deps = []
    const allArgs = this._collectAllArgs(definition)
    for (const arg of allArgs) {
      if (arg instanceof Reference) {
        deps.push(this._resolveAlias(arg.id))
      }
    }
    return deps
  }

  // ─── Check 3: Unresolved parameters ───────────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkUnresolvedParameters (result) {
    for (const [id, definition] of this._container.definitions) {
      if (definition.abstract || definition.synthetic) {
        continue
      }
      const allArgs = this._collectAllArgs(definition)
      for (const arg of allArgs) {
        if (arg instanceof ParameterReference) {
          if (!this._container.hasParameter(arg.key)) {
            result.addError(
              'unresolved_parameter',
              id,
              `%${arg.key}%`,
              `Service '${id}' uses undefined parameter '%${arg.key}%'`
            )
          }
        }
      }
    }
  }

  // ─── Check 4: Unused nullable fallbacks ───────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkUnusedNullableFallbacks (result) {
    for (const [id, definition] of this._container.definitions) {
      if (definition.abstract || definition.synthetic) {
        continue
      }
      const allArgs = this._collectAllArgs(definition)
      for (const arg of allArgs) {
        if (arg instanceof Reference && arg.nullable) {
          const refId = arg.id
          if (this._serviceExists(refId)) {
            result.addWarning(
              'unused_nullable_fallback',
              id,
              `@?${refId}`,
              `Service '${id}' uses a nullable reference to '@${refId}' but it always exists (dead optional)`
            )
          }
        }
      }
    }
  }

  // ─── Check 5: Deprecated services in use ──────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkDeprecatedServicesInUse (result) {
    const definitions = this._container.definitions
    for (const [id, definition] of definitions) {
      if (definition.deprecated || definition.abstract || definition.synthetic) {
        continue
      }
      const allArgs = this._collectAllArgs(definition)
      for (const arg of allArgs) {
        if (arg instanceof Reference) {
          const refId = this._resolveAlias(arg.id)
          if (definitions.has(refId)) {
            const refDef = definitions.get(refId)
            if (refDef.deprecated) {
              result.addWarning(
                'deprecated_service_in_use',
                id,
                `@${refId}`,
                `'${id}' uses deprecated service '@${refId}': ${refDef.deprecated}`
              )
            }
          }
        }
      }
    }
  }

  // ─── Check 6: Orphan tagged services ──────────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkOrphanTaggedServices (result) {
    const usedTags = new Set()

    for (const definition of this._container.definitions.values()) {
      const allArgs = this._collectAllArgs(definition)
      for (const arg of allArgs) {
        if (arg instanceof TagReference) {
          usedTags.add(arg.name)
        }
      }
    }

    const definedTags = new Map()

    for (const [id, definition] of this._container.definitions) {
      for (const tag of definition.tags) {
        if (!definedTags.has(tag.name)) {
          definedTags.set(tag.name, [])
        }
        definedTags.get(tag.name).push(id)
      }
    }

    for (const [tagName] of definedTags) {
      if (!usedTags.has(tagName)) {
        result.addInfo(
          'orphan_tagged_service',
          '',
          `tag:${tagName}`,
          `Tag '${tagName}' is defined on services but no consumer uses it via TagReference`
        )
      }
    }
  }

  // ─── Check 7: Keyed groups with no default ────────────────────────────────

  /**
   * @param {ValidationResult} result
   * @private
   */
  _checkKeyedGroupsWithNoDefault (result) {
    const tagGroups = new Map()

    for (const [id, definition] of this._container.definitions) {
      for (const tag of definition.tags) {
        if (!tagGroups.has(tag.name)) {
          tagGroups.set(tag.name, [])
        }
        tagGroups.get(tag.name).push({ id, attributes: tag.attributes })
      }
    }

    for (const [tagName, services] of tagGroups) {
      if (services.length > 1) {
        const hasDefault = services.some(
          (s) => s.attributes && s.attributes.get('default') === true
        )
        if (!hasDefault) {
          result.addInfo(
            'keyed_group_no_default',
            '',
            `tag:${tagName}`,
            `Tag group '${tagName}' has ${services.length} services but none has 'default: true' (autowiring ambiguity)`
          )
        }
      }
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Collect all argument values (constructor args + calls args + properties) from a definition.
   * @param {import('./Definition').default} definition
   * @returns {Array}
   * @private
   */
  _collectAllArgs (definition) {
    const args = []

    for (const arg of definition.args) {
      args.push(arg)
    }
    for (const arg of definition.appendArgs) {
      args.push(arg)
    }

    for (const arg of this._collectParentAppendArgs(definition.parent)) {
      args.push(arg)
    }

    for (const call of definition.calls) {
      for (const arg of call.args) {
        args.push(arg)
      }
    }
    for (const [, value] of definition.properties) {
      args.push(value)
    }

    if (definition.factory && definition.factory.Object instanceof Reference) {
      args.push(definition.factory.Object)
    }

    return args
  }

  /**
   * @param {string} id
   * @returns {boolean}
   * @private
   */
  _serviceExists (id) {
    const resolvedId = this._resolveAlias(id)
    return this._container.definitions.has(resolvedId) ||
      (resolvedId === 'service_container' && this._container.containerReferenceAsService)
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
        return resolvedId
      }
      seen.add(resolvedId)
      resolvedId = alias.get(resolvedId)
    }

    return resolvedId
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
}
