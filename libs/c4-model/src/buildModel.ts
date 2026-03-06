import { glob } from 'glob'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import { Model } from './model'
import { ElementArchetype, RelationshipArchetype } from './archetype'

declare const __dirname: string | undefined
const _dirname: string = typeof __dirname !== 'undefined' ? __dirname : dirname(fileURLToPath(import.meta.url))

type Catalog = Record<string, unknown>
type RootCatalog = Record<string, Catalog>

export interface AnyC4Module {
    readonly key: string
    registerDefinitions(model: Model, archetypes: Record<string, ElementArchetype | RelationshipArchetype>): Catalog
    buildRelationships(
        local: Catalog,
        dependencies: RootCatalog,
        archetypes: Record<string, ElementArchetype | RelationshipArchetype>
    ): void
}

export interface BuildModelOptions {
    modelName?: string
    modules?: ReadonlyArray<AnyC4Module>
    globPath?: string
    searchRoot?: string
    archetypes?: Record<string, ElementArchetype | RelationshipArchetype>
}

export async function buildModelWithCatalog<TRoot>(options: BuildModelOptions = {}): Promise<{ model: Model; catalog: TRoot }> {
    const { modelName = 'model', modules: explicitModules, archetypes = {} } = options
    const model = new Model(modelName)

    let c4Modules: AnyC4Module[]

    if (explicitModules) {
        c4Modules = [...explicitModules]
    } else {
        const { globPath = 'c4.dsl.ts', searchRoot = _dirname } = options
        const result = await glob(`**/${globPath}`, { cwd: searchRoot })
        if (result.length === 0) {
            throw new Error(`No ${globPath} files found`)
        }
        const imported = await Promise.all(result.map((file) => import(join(searchRoot, file))))
        c4Modules = imported.filter((m) => m.c4Module).map((m) => m.c4Module as AnyC4Module)
    }

    if (c4Modules.length === 0) {
        throw new Error('No c4Module instances found')
    }

    const registrations: Array<{ instance: AnyC4Module; key: string; local: Catalog }> = []
    const rootCatalog: RootCatalog = {}

    // Phase 1: each module registers its own definitions; results are nested under the module's key
    for (const instance of c4Modules) {
        const local: Catalog = instance.registerDefinitions(model, archetypes)
        rootCatalog[instance.key] = local
        registrations.push({ instance, key: instance.key, local })
    }

    // Phase 2: each module receives its own slice (local) and every other module's slice (dependencies) to build relationships
    for (const { instance, key, local } of registrations) {
        const dependencies = Object.fromEntries(Object.entries(rootCatalog).filter(([k]) => k !== key)) as Record<string, Catalog>
        instance.buildRelationships(local, dependencies, archetypes)
    }

    return { model, catalog: rootCatalog as TRoot }
}

export async function buildModel(options: BuildModelOptions = {}): Promise<Model> {
    return (await buildModelWithCatalog(options)).model
}
