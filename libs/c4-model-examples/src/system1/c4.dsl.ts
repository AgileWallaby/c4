import { C4Module, Model, Person } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog } from '../catalog'

export function buildModel(model: Model) {
    model.definePerson('person1')
    model.referenceSoftwareSystem('softwareSystem1')
}

export type System1Catalog = { person1: Person }

export const c4Module: C4Module<ExampleSystemCatalog, System1Catalog> = {
    key: 'system1',
    registerDefinitions(model: Model): System1Catalog {
        const person1 = model.definePerson('person1')
        return { person1 }
    },
    buildRelationships(local, dependencies): void {
        local.person1.uses(dependencies.system2.softwareSystem1)
    },
}
