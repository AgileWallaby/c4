import { Component } from "./component"
import { Container } from "./container"
import { SoftwareSystem } from "./softwareSystem"

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
  public readonly technology?: string

  constructor(name: string, defaultTags: string[] = [], definition?: TechnologyDefinition) {
    super(name, defaultTags, definition)
    this.technology = definition?.technology
  }
}

export class Relationship {
  public readonly description?: string
  public readonly tags: ReadonlyArray<string>
  public readonly technology?: string

  constructor(public readonly source: Element, public readonly destination: Element | Reference<SoftwareSystem | Container | Component>, definition?: TechnologyDefinition) {
    this.description = definition?.description
    this.technology = definition?.technology
    this.tags = (definition?.tags ?? []).concat(["Relationship"])
  }
}

export class Reference<T> {
  private readonly _children = new Map<string, Reference<T>>()

  constructor(public readonly name: string) {
  }

  protected referenceChild(name: string, x: (namex: string) => Reference<T>): Reference<T> {
    let child = this._children.get(name)
    if (!child) {
      child = x(name)
      this._children.set(name, child)
    }
    return child
  }
}
