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
      const definitionsToOverride = container.instanceManager.searchNotOverrideDefinitionsByObject(definitionToOverride.Object)

      for (const overrideArg of definitionToOverride.overrideArgs) {
        const argumentsToOverride = this._searchDefinitionsByClassName(overrideArg.id)
        const references = argumentsToOverride.map(arg => new Reference(arg.key))

        for (const [, definitionFromOverride] of definitionsToOverride) {
          definitionFromOverride.args = [...references]
        }
      }
    }

    this._removeDefinitions(toDelete)
  }

  /**
   * @param {string} className
   * @returns {Array} - Retorna los resultados de la búsqueda
   */
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
