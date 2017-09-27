export default class DecoratePass {
  /**
   * @return {string}
   */
  static get POSTFIX_INNER () {
    return 'inner'
  }

  /**
   * @param {ContainerBuilder} container
   */
  process (container) {
    let priority = []

    for (let definitionId of container.definitions.keys()) {
      let definition = container.definitions.get(definitionId)

      if (definition.decorationPriority) {
        priority[definition.decorationPriority] = {
          name: definitionId,
          definition: definition
        }
      } else if (definition.decoratedService &&
        !definitionId.includes(DecoratePass.POSTFIX_INNER)) {
        priority.push({name: definitionId, definition: definition})
      }
    }

    let decorates = priority.filter((item) => { return item !== null })
    for (let decorate of decorates) {
      container.setDefinition(`${decorate.name}.${DecoratePass.POSTFIX_INNER}`,
        container.definitions.get(decorate.definition.decoratedService))
      decorate.definition.public = true
      container.setDefinition(decorate.definition.decoratedService,
        decorate.definition)
    }
  }
}
