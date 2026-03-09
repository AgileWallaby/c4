import { Element, Group, TechnicalElement, TechnologyDefinition } from './core'
import { Component, ComponentDefinition } from './component'
import { ElementArchetype, mergeArchetypeWithOverride } from './archetype'

export type ContainerDefinition = TechnologyDefinition

interface DefineComponent {
    component(name: string, archetypeOrDef?: ElementArchetype | ComponentDefinition, override?: ComponentDefinition): Component
}

// TODO: This will be a Group<Container> if that is added back in
export class ContainerGroup extends Group implements DefineComponent {
    private _components = new Map<string, Component>()

    public constructor(
        public override readonly name: string,
        private readonly container: DefineComponent
    ) {
        super(name)
    }

    public component(name: string, archetypeOrDef?: ElementArchetype | ComponentDefinition, override?: ComponentDefinition): Component {
        const component = this.container.component(name, archetypeOrDef, override)
        this._components.set(name, component)
        return component
    }

    public getComponents(): ReadonlyArray<Component> {
        return Array.from(this._components.values())
    }
}

export class Container extends TechnicalElement implements DefineComponent {
    private _components = new Map<string, Component>()
    private _groups = new Map<string, ContainerGroup>()

    constructor(
        public override readonly name: string,
        definition?: ContainerDefinition,
        archetype?: ElementArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        super(name, ['Container'], definition, archetype, overrideDefinition)
    }

    public component(name: string, archetypeOrDef?: ElementArchetype | ComponentDefinition, override?: ComponentDefinition): Component {
        if (this._components.has(name)) {
            throw Error(`A Component named '${name}' is defined elsewhere in this Container. A Component can be defined only once.`)
        }

        let definition: ComponentDefinition | undefined
        let archetype: ElementArchetype | undefined
        if (archetypeOrDef instanceof ElementArchetype) {
            archetype = archetypeOrDef
            definition = mergeArchetypeWithOverride(archetypeOrDef, override)
        } else {
            definition = archetypeOrDef
        }

        const component = new Component(name, definition, archetype, override)

        this._components.set(name, component)

        return component
    }

    public addGroup(groupName: string): ContainerGroup {
        let group = this._groups.get(groupName)
        if (!group) {
            group = new ContainerGroup(groupName, this)
            this._groups.set(groupName, group)
        }
        return group
    }

    public getGroups(): ReadonlyArray<ContainerGroup> {
        return Array.from(this._groups.values())
    }

    public getComponentsNotInGroups(): ReadonlyArray<Component> {
        const componentsInGroups = this.getGroups().flatMap((group) => group.getComponents())
        return Array.from(this._components.values()).filter((component) => !componentsInGroups.includes(component))
    }

    public getChildElements(): ReadonlyArray<Element> {
        return Array.from(this._components.values())
    }
}
