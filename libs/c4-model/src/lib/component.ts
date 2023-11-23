import { Element, Reference, Relationship, TechnologyDefinition } from "./core"
import { Container } from "./container"
import { Person } from "./person"
import { SoftwareSystem } from "./softwareSystem"

export interface ComponentDefinition extends TechnologyDefinition {
}

export class Component extends Element {

  public relationships: Relationship[] = []

  constructor(public override readonly name: string, definition?: ComponentDefinition) {
    super(name, ["Component"], definition)
  }

  public uses(otherElement: Person | SoftwareSystem | Container | Component, definition?: TechnologyDefinition): void {
    const relationship = new Relationship(this, otherElement, definition)
    this.relationships.push(relationship)
  }
}

export class ReferencedComponent extends Reference<undefined> {
}
