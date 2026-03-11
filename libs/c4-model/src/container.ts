import { camelCase } from 'change-case'
import { Element, Group, TechnicalElement, TechnologyDefinition } from './core'
import { Component, ComponentDefinition } from './component'
import { ElementArchetype, mergeArchetypeWithOverride } from './archetype'

export type ContainerDefinition = TechnologyDefinition

interface DefineComponent {
    component(name: string, archetypeOrDef?: ElementArchetype | ComponentDefinition, override?: ComponentDefinition): Component
}

// TODO: This will be a Group<Container> if that is added back in
export class ContainerGroup extends Group<Component> implements DefineComponent {
    private _components = new Map<string, Component>()
    private _groups = new Map<string, ContainerGroup>()

    public constructor(
        public override readonly name: string,
        private readonly container: DefineComponent,
        private readonly pathSegments: string[] = []
    ) {
        super(name)
    }

    public override get canonicalName(): string {
        return camelCase([...this.pathSegments, this.name].join(' '))
    }

    public get dslName(): string {
        return [...this.pathSegments, this.name].join('/')
    }

    public component(name: string, archetypeOrDef?: ElementArchetype | ComponentDefinition, override?: ComponentDefinition): Component {
        const component = this.container.component(name, archetypeOrDef, override)
        this._components.set(name, component)
        return component
    }

    public group(groupName: string): ContainerGroup {
        let group = this._groups.get(groupName)
        if (!group) {
            group = new ContainerGroup(groupName, this.container, [...this.pathSegments, this.name])
            this._groups.set(groupName, group)
        }
        return group
    }

    public getGroups(): ReadonlyArray<ContainerGroup> {
        return Array.from(this._groups.values())
    }

    public getComponents(): ReadonlyArray<Component> {
        return Array.from(this._components.values())
    }

    public getAllComponents(): ReadonlyArray<Component> {
        return [
            ...this._components.values(),
            ...Array.from(this._groups.values()).flatMap((g) => g.getAllComponents()),
        ]
    }
}

export class Container extends TechnicalElement<Component> implements DefineComponent {
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

    public group(groupName: string): ContainerGroup {
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
        const componentsInGroups = this.getGroups().flatMap((group) => group.getAllComponents())
        return Array.from(this._components.values()).filter((component) => !componentsInGroups.includes(component))
    }

    public getChildElements(): ReadonlyArray<Element> {
        return Array.from(this._components.values())
    }
}
