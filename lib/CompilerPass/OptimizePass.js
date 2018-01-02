export default class OptimizePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    for (let [id, definition] of container.definitions) {
      if (!container.isSet(id) && !definition.lazy) {
        let instance = container.instanceManager
          .getInstanceFromDefinition(definition)
        container.set(id, instance)
      }
    }
    container.frozen = true
  }
}
