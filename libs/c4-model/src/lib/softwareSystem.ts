import { Definition, Element, Relationship, TechnologyDefinition } from './core'
import { Container } from './container'
import { Component } from './component'
import { Person } from './person'

export interface SoftwareSystemDefinition extends Definition {
}

export class SoftwareSystem extends Element {

  private _relationships: Relationship[] = []

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
}
