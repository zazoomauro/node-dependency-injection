export default class RemovePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    for (const [id, definition] of container.definitions) {
      if (definition.public === false) {
        container.remove(id)
      }
    }
  }
}
