export interface Definition {
  description?: string
  tags?: string[]
}

export interface TechnologyDefinition extends Definition {
  technology?: string
}

export abstract class Element {
  public readonly description?: string
  public readonly tags: ReadonlyArray<string>

  constructor(public readonly name: string, defaultTags: string[] = [], definition?: Definition) {
    this.description = definition?.description
    this.tags = (definition?.tags ?? []).concat(["Element"]).concat(defaultTags)
  }
}

export abstract class TechnicalElement extends Element {
  public technology: string = ""
}

export class Relationship {
  public readonly description?: string
  public readonly tags: ReadonlyArray<string>
  public readonly technology?: string

  constructor(public readonly source: Element, public readonly destination: Element, definition?: TechnologyDefinition) {
    this.description = definition?.description
    this.technology = definition?.technology
    this.tags = (definition?.tags ?? []).concat(["Relationship"])
  }
}
