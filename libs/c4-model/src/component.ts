import { Element, TechnicalElement, TechnologyDefinition } from './core'
import { ElementArchetype } from './archetype'

export type ComponentDefinition = TechnologyDefinition

export class Component extends TechnicalElement {
    constructor(
        public override readonly name: string,
        definition?: ComponentDefinition,
        archetype?: ElementArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        super(name, ['Component'], definition, archetype, overrideDefinition)
    }

    public getChildElements(): ReadonlyArray<Element> {
        return []
    }
}
