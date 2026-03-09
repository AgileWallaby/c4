import { Group } from './core'
import { SoftwareSystem, SoftwareSystemDefinition } from './softwareSystem'
import { Person, PersonDefinition } from './person'
import { ElementArchetype, RelationshipArchetype, mergeArchetypeWithOverride } from './archetype'

// Finds every key in TRoot whose value is assignable to TModule.
// Unconstrained generics so concrete catalog interfaces (which lack index signatures) satisfy it.
export type CatalogKeyOf<TRoot, TModule> = {
    [K in keyof TRoot]: TRoot[K] extends TModule ? K : never
}[keyof TRoot]

// Everything in the root catalog expect the module's own slice.
export type Dependencies<TRoot, TModule> = Omit<TRoot, CatalogKeyOf<TRoot, TModule>>

export interface C4Module<TRoot, TLocal, TArchetypes = Record<string, ElementArchetype | RelationshipArchetype>> {
    readonly key: CatalogKeyOf<TRoot, TLocal>
    registerDefinitions(model: Model, archetypes: TArchetypes): TLocal
    buildRelationships(local: TLocal, dependencies: Dependencies<TRoot, TLocal>, archetypes: TArchetypes): void
}

interface DefineSoftwareSystem {
    softwareSystem(
        name: string,
        archetypeOrDef?: ElementArchetype | SoftwareSystemDefinition,
        override?: SoftwareSystemDefinition
    ): SoftwareSystem
}

interface DefinePerson {
    person(name: string, archetypeOrDef?: ElementArchetype | PersonDefinition, override?: PersonDefinition): Person
}

// TODO: This will be a Group of type <SoftwareSystem | Person> if that is added back in
export class ModelGroup extends Group implements DefineSoftwareSystem, DefinePerson {
    private softwareSystems = new Map<string, SoftwareSystem>()
    private people = new Map<string, Person>()

    public constructor(
        public override readonly name: string,
        private readonly model: DefineSoftwareSystem & DefinePerson
    ) {
        super(name)
    }

    public softwareSystem(
        name: string,
        archetypeOrDef?: ElementArchetype | SoftwareSystemDefinition,
        override?: SoftwareSystemDefinition
    ): SoftwareSystem {
        const softwareSystem = this.model.softwareSystem(name, archetypeOrDef, override)
        this.softwareSystems.set(name, softwareSystem)
        return softwareSystem
    }

    public person(name: string, archetypeOrDef?: ElementArchetype | PersonDefinition, override?: PersonDefinition): Person {
        const person = this.model.person(name, archetypeOrDef, override)
        this.people.set(name, person)
        return person
    }

    public getSoftwareSystems(): ReadonlyArray<SoftwareSystem> {
        return Array.from(this.softwareSystems.values())
    }

    public getPeople(): ReadonlyArray<Person> {
        return Array.from(this.people.values())
    }
}

export interface ModelDefinitions {
    softwareSystem(
        name: string,
        archetypeOrDef?: ElementArchetype | SoftwareSystemDefinition,
        override?: SoftwareSystemDefinition
    ): SoftwareSystem
    person(name: string, archetypeOrDef?: ElementArchetype | PersonDefinition, override?: PersonDefinition): Person
}

export class Model {
    constructor(public name: string) {}

    private softwareSystems = new Map<string, SoftwareSystem>()
    private people = new Map<string, Person>()
    private groups = new Map<string, ModelGroup>()

    softwareSystem(
        name: string,
        archetypeOrDef?: ElementArchetype | SoftwareSystemDefinition,
        override?: SoftwareSystemDefinition
    ): SoftwareSystem {
        if (this.softwareSystems.has(name)) {
            throw Error(`A SoftwareSystem named '${name}' is defined elsewhere in this Model. A SoftwareSystem can be defined only once.`)
        }
        let definition: SoftwareSystemDefinition | undefined
        let archetype: ElementArchetype | undefined
        if (archetypeOrDef instanceof ElementArchetype) {
            archetype = archetypeOrDef
            definition = mergeArchetypeWithOverride(archetypeOrDef, override)
        } else {
            definition = archetypeOrDef
        }
        const system = new SoftwareSystem(name, definition, archetype, override)
        this.softwareSystems.set(name, system)
        return system
    }

    // TODO:Should be a Group<SoftwareSystem | Person> if that is added back in
    addGroup(groupName: string): Group & ModelDefinitions {
        let group = this.groups.get(groupName)
        if (!group) {
            group = new ModelGroup(groupName, this)
            this.groups.set(groupName, group)
        }
        return group
    }

    person(name: string, archetypeOrDef?: ElementArchetype | PersonDefinition, override?: PersonDefinition): Person {
        if (this.people.has(name)) {
            throw Error(`A Person named '${name}' is defined elsewhere in this Model. A Person can be defined only once.`)
        }
        let definition: PersonDefinition | undefined
        let archetype: ElementArchetype | undefined
        if (archetypeOrDef instanceof ElementArchetype) {
            archetype = archetypeOrDef
            definition = mergeArchetypeWithOverride(archetypeOrDef, override)
        } else {
            definition = archetypeOrDef
        }
        const person = new Person(name, definition, archetype, override)
        this.people.set(name, person)
        return person
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    validate() {}

    getPeople(): ReadonlyArray<Person> {
        return Array.from(this.people.values())
    }

    getSoftwareSystems(): ReadonlyArray<SoftwareSystem> {
        return Array.from(this.softwareSystems.values())
    }

    getPeopleNotInGroups(): ReadonlyArray<Person> {
        const peopleInGroups = Array.from(this.groups.values()).flatMap((group) => group.getPeople())
        return Array.from(this.people.values()).filter((person) => !peopleInGroups.includes(person))
    }

    getSoftwareSystemsNotInGroups(): ReadonlyArray<SoftwareSystem> {
        const systemsInGroups = Array.from(this.groups.values()).flatMap((group) => group.getSoftwareSystems())
        return Array.from(this.softwareSystems.values()).filter((system) => !systemsInGroups.includes(system))
    }

    getGroups(): ReadonlyArray<ModelGroup> {
        return Array.from(this.groups.values())
    }
}
