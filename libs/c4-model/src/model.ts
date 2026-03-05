import { glob } from 'glob'
import { join } from 'path'

import { Group } from './core'
import { SoftwareSystem, SoftwareSystemDefinition } from './softwareSystem'
import { Person, PersonDefinition } from './person'

// Finds every key in TRoot whose value is assignable to TModule.
// Unconstrained generics so concrete catalog interfaces (which lack index signatures) satisfy it.
export type CatalogKeyOf<TRoot, TModule> = {
    [K in keyof TRoot]: TRoot[K] extends TModule ? K : never
}[keyof TRoot]

// Everything in the root catalog expect the module's own slice.
export type Dependencies<TRoot, TModule> = Omit<TRoot, CatalogKeyOf<TRoot, TModule>>

export interface C4Module<TRoot, TLocal> {
    readonly key: CatalogKeyOf<TRoot, TLocal>
    registerDefinitions(model: Model): TLocal
    buildRelationships(local: TLocal, dependencies: Dependencies<TRoot, TLocal>): void
}

interface DefineSoftwareSystem {
    defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem
}

interface DefinePerson {
    definePerson(name: string, definition?: PersonDefinition): Person
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

    public defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
        const softwareSystem = this.model.defineSoftwareSystem(name, definition)
        this.softwareSystems.set(name, softwareSystem)
        return softwareSystem
    }

    public definePerson(name: string, definition?: PersonDefinition): Person {
        const person = this.model.definePerson(name, definition)
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
    defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem
    definePerson(name: string, definition?: PersonDefinition): Person
}

export class Model {
    constructor(public name: string) {}

    private softwareSystems = new Map<string, SoftwareSystem>()
    private people = new Map<string, Person>()
    private groups = new Map<string, ModelGroup>()

    defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
        if (this.softwareSystems.has(name)) {
            throw Error(`A SoftwareSystem named '${name}' is defined elsewhere in this Model. A SoftwareSystem can be defined only once.`)
        }
        const system = new SoftwareSystem(name, definition)
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

    definePerson(name: string, definition?: PersonDefinition): Person {
        if (this.people.has(name)) {
            throw Error(`A Person named '${name}' is defined elsewhere in this Model. A Person can be defined only once.`)
        }
        const person = new Person(name, definition)
        this.people.set(name, person)
        return person
    }

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

export interface BuildModelOptions {
    modelName?: string
    globPath?: string
    searchRoot?: string
}

export async function buildModel(options: BuildModelOptions = {}): Promise<Model> {
    const { modelName = 'model', globPath = 'c4.dsl.ts', searchRoot = __dirname } = options
    const model = new Model(modelName)

    const result = await glob(`**/${globPath}`, { cwd: searchRoot })

    if (result.length === 0) {
        throw new Error(`No ${globPath} files found`)
    }

    type Catalog = Record<string, unknown>
    type RootCatalog = Record<string, Catalog>
    interface AnyC4Module {
        readonly key: string
        registerDefinitions(model: Model): Catalog
        buildRelationships(local: Catalog, dependencies: RootCatalog): void
    }
    const modules = await Promise.all(result.map((file) => import(join(searchRoot, file))))
    const registrations: Array<{ instance: AnyC4Module; key: string; local: Catalog }> = []
    const rootCatalog: RootCatalog = {}

    // Phase 1: each module registers its own definitions; results are nested under the module's key
    for (const module of modules) {
        if (!module.c4Module) {
            continue
        }
        const instance = module.c4Module as AnyC4Module
        const local: Catalog = instance.registerDefinitions(model)
        rootCatalog[instance.key] = local
        registrations.push({ instance, key: instance.key, local })
    }

    if (registrations.length === 0) {
        throw new Error(`No c4Module exports found in any ${globPath} files`)
    }

    // Phase 2: each module receives its own slice (local) and every other module's slice (dependencies) to build relationships
    for (const { instance, key, local } of registrations) {
        const dependencies = Object.fromEntries(Object.entries(rootCatalog).filter(([k]) => k !== key)) as Record<string, Catalog>
        instance.buildRelationships(local, dependencies)
    }

    return model
}
