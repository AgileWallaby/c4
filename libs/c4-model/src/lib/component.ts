import { Element, Reference, TechnicalElement, TechnologyDefinition } from './core'

export type ComponentDefinition = TechnologyDefinition

export class Component extends TechnicalElement {
    constructor(
        public override readonly name: string,
        definition?: ComponentDefinition
    ) {
        super(name, ['Component'], definition)
    }

    public getChildElements(): ReadonlyArray<Element> {
        return []
    }
}

export class ReferencedComponent extends Reference<undefined> {}
