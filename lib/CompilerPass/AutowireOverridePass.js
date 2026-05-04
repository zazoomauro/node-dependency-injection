import Reference from '../Reference'

export default class AutowireOverridePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    this._container = container
    this._definitions = container.instanceManager.definitions

    this._classNameIndex = new Map()
    for (const [key, definition] of this._definitions) {
      const name = definition.Object?.name
      if (name) {
        if (!this._classNameIndex.has(name)) {
          this._classNameIndex.set(name, [])
        }
        this._classNameIndex.get(name).push({ key, definition })
      }
    }

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
    return this._classNameIndex.get(className) ?? []
  }

  _removeDefinitions (keysToDelete) {
    for (const key of keysToDelete) {
      this._container.removeDefinition(key)
    }
  }
}
