export default class OptimizePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    for (const [id, definition] of container.definitions) {
      if (!container.isSet(id) && !definition.lazy && !definition.abstract) {
        const instance = container.instanceManager.getInstanceFromDefinition(
          definition)
        container.set(id, instance)
      }
    }
    container.frozen = true
  }
}
