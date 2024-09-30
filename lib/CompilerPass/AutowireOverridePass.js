import Reference from '../Reference'

export default class AutowireOverridePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    this._definitions = container.instanceManager.definitions
    const overrideDefinitions = container.instanceManager.searchDefinitionsToOverrideArgs()
    const toDelete = []

    for (const [key, definitionToOverride] of overrideDefinitions) {
      toDelete.push(key)
      this._processOverride(definitionToOverride, container)
    }

    this._removeDefinitions(toDelete)
  }

  _processOverride (definitionToOverride, container) {
    const definitionsToOverride = container.instanceManager.searchNotOverrideDefinitionsByObject(definitionToOverride.Object)
    const referencesToOverride = []

    for (const overrideArg of definitionToOverride.overrideArgs) {
      referencesToOverride.push(...this._getReferencesForOverrideArg(overrideArg.id))
    }
    for (const [, definitionFromOverride] of definitionsToOverride) {
      definitionFromOverride.args = referencesToOverride
    }
  }

  _getReferencesForOverrideArg (overrideArgId) {
    const argumentsToOverride = this._searchDefinitionsByClassName(overrideArgId)
    return argumentsToOverride.map(arg => new Reference(arg.key))
  }

  _searchDefinitionsByClassName (className) {
    const result = []
    for (const [key, definition] of this._definitions) {
      if (definition.Object?.name === className) {
        result.push({ key, definition })
      }
    }
    return result
  }

  _removeDefinitions (keysToDelete) {
    for (const key of keysToDelete) {
      this._definitions.delete(key)
    }
  }
}
