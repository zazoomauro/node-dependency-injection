export default class RemovePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    for (let [id, definition] of container.definitions) {
      if (definition.public === false) {
        container.remove(id)
      }
    }
  }
}
