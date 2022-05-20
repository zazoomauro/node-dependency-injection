export default class DecoratePass {
  /**
   * @return {string}
   */
  static get POSTFIX_INNER () {
    return 'inner'
  }

  /**
   * @param {string} definitionId
   * @private
   */
  async _processDefinitionKeys (definitionId) {
    const definition = this._container.definitions.get(definitionId)

    if (definition.decorationPriority) {
      this._priority[definition.decorationPriority] = {
        name: definitionId,
        definition: definition
      }
    } else if (definition.decoratedService &&
      !definitionId.includes(DecoratePass.POSTFIX_INNER)) {
      this._priority.push({ name: definitionId, definition: definition })
    }
  }

  /**
   * @param {object} decorate
   * @private
   */
  async _processDecorates (decorate) {
    this._container.setDefinition(
      `${decorate.name}.${DecoratePass.POSTFIX_INNER}`,
      this._container.definitions.get(decorate.definition.decoratedService))
    decorate.definition.public = true
    this._container.setDefinition(decorate.definition.decoratedService,
      decorate.definition)
  }

  /**
   * @param {ContainerBuilder} container
   */
  async process (container) {
    this._container = container
    this._priority = []
    const promises = []
    for (const definitionId of container.definitions.keys()) {
      promises.push(this._processDefinitionKeys(definitionId))
    }
    const decorates = this._priority.filter((item) => { return item !== null })
    for (const decorate of decorates) {
      promises.push(this._processDecorates(decorate))
    }
    await Promise.all(promises)
  }
}
