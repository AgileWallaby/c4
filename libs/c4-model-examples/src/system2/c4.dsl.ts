import { C4Module, Model, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog } from '../catalog'

export function buildModel(model: Model) {
    model.referencePerson('person1')
    model.defineSoftwareSystem('softwareSystem1')
}

export type System2Catalog = { softwareSystem1: SoftwareSystem }

export const c4Module: C4Module<ExampleSystemCatalog, System2Catalog> = {
    key: 'system2',
    registerDefinitions(model: Model): System2Catalog {
        const softwareSystem1 = model.defineSoftwareSystem('softwareSystem1')
        return { softwareSystem1 }
    },
    buildRelationships(_local, _dependencies): void {},
}
