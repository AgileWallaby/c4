import { Definition, Element, Group, TechnologyDefinition } from './core'
import { Container, ContainerDefinition } from './container'
import { ElementArchetype, mergeArchetypeWithOverride } from './archetype'

export type SoftwareSystemDefinition = Definition

interface DefineContainer {
    container(name: string, archetypeOrDef?: ElementArchetype | ContainerDefinition, override?: ContainerDefinition): Container
}

export interface SoftwareSystemReference {
    name: string
}

// TODO: This will be a Group<Container> if that is added back in
export class SoftwareSystemGroup extends Group implements DefineContainer {
    private _containers = new Map<string, Container>()

    public constructor(
        public override readonly name: string,
        private readonly softwareSystem: DefineContainer
    ) {
        super(name)
    }

    public container(name: string, archetypeOrDef?: ElementArchetype | ContainerDefinition, override?: ContainerDefinition): Container {
        const container = this.softwareSystem.container(name, archetypeOrDef, override)
        this._containers.set(name, container)
        return container
    }

    public getContainers(): ReadonlyArray<Container> {
        return Array.from(this._containers.values())
    }
}

export class SoftwareSystem extends Element implements DefineContainer {
    private _containers = new Map<string, Container>()
    private _groups = new Map<string, SoftwareSystemGroup>()

    constructor(
        public override readonly name: string,
        definition?: SoftwareSystemDefinition,
        archetype?: ElementArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        super(name, ['Software System'], definition, archetype, overrideDefinition)
    }

    public container(name: string, archetypeOrDef?: ElementArchetype | ContainerDefinition, override?: ContainerDefinition): Container {
        if (this._containers.has(name)) {
            throw Error(`A Container named '${name}' is defined elsewhere in this SoftwareSystem. A Container can be defined only once.`)
        }

        let definition: ContainerDefinition | undefined
        let archetype: ElementArchetype | undefined
        if (archetypeOrDef instanceof ElementArchetype) {
            archetype = archetypeOrDef
            definition = mergeArchetypeWithOverride(archetypeOrDef, override)
        } else {
            definition = archetypeOrDef
        }

        const container = new Container(name, definition, archetype, override)

        this._containers.set(name, container)

        return container
    }

    public addGroup(groupName: string): SoftwareSystemGroup {
        let group = this._groups.get(groupName)
        if (!group) {
            group = new SoftwareSystemGroup(groupName, this)
            this._groups.set(groupName, group)
        }
        return group
    }

    public getGroups(): ReadonlyArray<SoftwareSystemGroup> {
        return Array.from(this._groups.values())
    }

    public getChildElements(): ReadonlyArray<Element> {
        return Array.from(this._containers.values())
    }

    public getContainersNotInGroups(): ReadonlyArray<Container> {
        const containersInGroups = Array.from(this._groups.values()).flatMap((group) => group.getContainers())
        return Array.from(this._containers.values()).filter((container) => !containersInGroups.includes(container))
    }
}
