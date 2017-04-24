export default class OptimizePass {
  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    for (let decoratedDefinitionId of container.definitions.keys()) {
      let decoratesDefinition = container.definitions.get(decoratedDefinitionId)

      if (decoratesDefinition.decoratedService) {
        container.setDefinition(
          `${decoratedDefinitionId}.inner`,
          container.definitions.get(decoratesDefinition.decoratedService),
        )

        decoratesDefinition.public = true
        container.setDefinition(
          decoratesDefinition.decoratedService,
          decoratesDefinition,
        )
      }
    }
  }
}
