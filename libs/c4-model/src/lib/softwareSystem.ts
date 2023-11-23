import { Definition, Element, Relationship, TechnologyDefinition } from './core'
import { Container, ContainerDefinition } from './container'
import { Component } from './component'
import { Person } from './person'

export interface SoftwareSystemDefinition extends Definition {
}

export interface SoftwareSystemReference {
  name: string
}

export class SoftwareSystem extends Element {

  private _relationships: Relationship[] = []
  private _containers = new Map<string, Container>();

  constructor(public override readonly name: string, definition?: SoftwareSystemDefinition) {
    super(name, ["Software System"], definition)
  }

  public uses(otherElement: Person | SoftwareSystem | Container | Component, definition?: TechnologyDefinition): void {
    const relationship = new Relationship(this, otherElement, definition)
    this._relationships.push(relationship)
  }

  public get relationships(): ReadonlyArray<Relationship> {
    return this._relationships
  }

  public defineContainer(name: string, definition?: ContainerDefinition): Container {
    if (this._containers.has(name)) {
      throw Error(`A Container named '${name}' is defined elsewhere in this SoftwareSystem. A Container can be defined only once, but can be referenced multiple times.`)
    }

    const container = new Container(name, definition)

    this._containers.set(name, container);

    return container
  }
}
