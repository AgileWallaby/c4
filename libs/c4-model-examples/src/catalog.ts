import type { System1Catalog } from './system1/c4.dsl'
import type { System2Catalog } from './system2/c4.dsl'

export type RootCatalog = {
    system1: System1Catalog
    system2: System2Catalog
}
