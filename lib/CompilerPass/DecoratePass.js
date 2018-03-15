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
  _processDefinitionKeys (definitionId) {
    let definition = this._container.definitions.get(definitionId)

    if (definition.decorationPriority) {
      this._priority[definition.decorationPriority] = {
        name: definitionId,
        definition: definition
      }
    } else if (definition.decoratedService &&
      !definitionId.includes(DecoratePass.POSTFIX_INNER)) {
      this._priority.push({name: definitionId, definition: definition})
    }
  }

  /**
   * @param {object} decorate
   * @private
   */
  _processDecorates (decorate) {
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
  process (container) {
    this._container = container
    this._priority = []

    for (let definitionId of container.definitions.keys()) {
      this._processDefinitionKeys(definitionId)
    }

    let decorates = this._priority.filter((item) => { return item !== null })
    for (let decorate of decorates) {
      this._processDecorates(decorate)
    }
  }
}
