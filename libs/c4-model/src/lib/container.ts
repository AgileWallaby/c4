import { Element, Relationship, TechnologyDefinition } from "./core"
import { Component } from "./component"
import { Person } from "./person"
import { SoftwareSystem } from "./softwareSystem"

export interface ContainerDefinition extends TechnologyDefinition {

}

export class Container extends Element {

  public relationships: Relationship[] = []

  constructor(public override readonly name: string, definition?: ContainerDefinition) {
    super(name, ["Container"], definition)
  }

  public uses(otherElement: Person | SoftwareSystem | Container | Component, definition?: TechnologyDefinition): void {
    const relationship = new Relationship(this, otherElement, definition)
    this.relationships.push(relationship)
  }
}
