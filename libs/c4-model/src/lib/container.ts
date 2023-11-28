import { Element, Group, Reference, TechnicalElement, TechnologyDefinition } from './core'
import { Component, ComponentDefinition, ReferencedComponent } from './component'

export type ContainerDefinition = TechnologyDefinition

interface DefineComponent {
    defineComponent(name: string, definition?: ComponentDefinition): Component
}

export class ContainerGroup extends Group<Container> implements DefineComponent {
    private _components = new Map<string, Component>()

    public constructor(
        public override readonly name: string,
        private readonly container: DefineComponent
    ) {
        super(name)
    }

    public defineComponent(name: string, definition?: ComponentDefinition): Component {
        const component = this.container.defineComponent(name, definition)
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
        definition?: ContainerDefinition
    ) {
        super(name, ['Container'], definition)
    }

    public defineComponent(name: string, definition?: ComponentDefinition): Component {
        if (this._components.has(name)) {
            throw Error(
                `A Component named '${name}' is defined elsewhere in this Container. A Component can be defined only once, but can be referenced multiple times.`
            )
        }

        const component = new Component(name, definition)

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

export class ReferencedContainer extends Reference<Component> {
    public referenceComponent(name: string): ReferencedComponent {
        const componentReference = this.referenceChild(name, (name: string) => new ReferencedComponent(name))
        return componentReference as ReferencedComponent
    }
}
