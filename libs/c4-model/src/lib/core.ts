import { Component, ReferencedComponent } from "./component"
import { Container, ReferencedContainer } from "./container"
import { ReferencedSoftwareSystem, SoftwareSystem } from "./softwareSystem"
import { Person } from "./person"

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

  private _relationships: Relationship[] = []

  constructor(public readonly name: string, defaultTags: string[] = [], definition?: Definition) {
    this.description = definition?.description
    this.tags = (definition?.tags ?? []).concat(["Element"]).concat(defaultTags)
  }

  public get canonicalName(): string {
    return this.name.toLowerCase()
  }

  public uses(otherElement: RelationshipTarget, definition?: TechnologyDefinition): void {
    const relationship = new Relationship(this, otherElement, definition)
    this._relationships.push(relationship)
  }

  public get relationships(): ReadonlyArray<Relationship> {
    return this._relationships
  }

  public abstract getChildElements(): ReadonlyArray<Element>

  public getRelationshipsInHierarchy(): ReadonlyArray<Relationship> {
    return this._relationships.concat(this.getChildElements().flatMap(element => element.getRelationshipsInHierarchy()))
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
  private readonly _references = new Map<string, Reference<T>>()

  constructor(public readonly name: string) {
  }

  public get canonicalName(): string {
    return this.name.toLowerCase()
  }

  protected referenceChild(name: string, createChild: (childName: string) => Reference<T>): Reference<T> {
    let reference = this._references.get(name)
    if (!reference) {
      reference = createChild(name)
      this._references.set(name, reference)
    }
    return reference
  }

  public get references(): ReadonlyArray<Reference<T>> {
    return Array.from(this._references.values())
  }

  public getChildElementNames(path?: string): ReadonlyArray<string> {
    const result = Array.from(this._references.values()).flatMap(reference => {
      const currentPath = `${path ? path : '' + this.name}.${reference.name}`
      return [currentPath, ...reference.getChildElementNames(currentPath)]
    })
    return result
  }
}

export type RelationshipTarget = Person | SoftwareSystem | ReferencedSoftwareSystem | Container | ReferencedContainer | Component | ReferencedComponent
