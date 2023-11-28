import { Definition, Element, Reference, Relationship, RelationshipTarget } from './core'

export type PersonDefinition = Definition

export class Person extends Element {
    constructor(
        public override readonly name: string,
        definition?: PersonDefinition
    ) {
        super(name, ['Person'], definition)
    }

    public getChildElements(): ReadonlyArray<Element> {
        return []
    }

    public override uses(otherElement: RelationshipTarget, definition?: Definition): void {
        super.uses(otherElement, definition)
        // base(this).uses(otherElement, definition)
        // const relationship = new Relationship(this, otherElement, definition)
        // this._relationships.push(relationship)
    }
}

export class ReferencedPerson extends Reference<undefined> {}
