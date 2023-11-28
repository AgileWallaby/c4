import { Definition, Element, Reference, RelationshipTarget } from './core'

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
    }
}

export class ReferencedPerson extends Reference<undefined> {}
