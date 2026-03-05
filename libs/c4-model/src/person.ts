import { Definition, Element } from './core'

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
}
