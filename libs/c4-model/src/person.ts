import { Definition, Element, TechnologyDefinition } from './core'
import { ElementArchetype } from './archetype'

export type PersonDefinition = Definition

export class Person extends Element {
    constructor(
        public override readonly name: string,
        definition?: PersonDefinition,
        archetype?: ElementArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        super(name, ['Person'], definition, archetype, overrideDefinition)
    }

    public getChildElements(): ReadonlyArray<Element> {
        return []
    }
}
