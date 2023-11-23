import { Element, Reference, Relationship, RelationshipTarget, TechnologyDefinition } from "./core"

export interface ComponentDefinition extends TechnologyDefinition {
}

export class Component extends Element {

  private _relationships: Relationship[] = []

  constructor(public override readonly name: string, definition?: ComponentDefinition) {
    super(name, ["Component"], definition)
  }

  public uses(otherElement: RelationshipTarget, definition?: TechnologyDefinition): void {
    const relationship = new Relationship(this, otherElement, definition)
    this._relationships.push(relationship)
  }

  public get relationships(): ReadonlyArray<Relationship> {
    return this._relationships
  }
}

export class ReferencedComponent extends Reference<undefined> {
}
