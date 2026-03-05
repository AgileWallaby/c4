# c4-model

## Structurizr DSL Reference

Structurizr DSL docs are available locally at `docs/structurizr/` (run
`pnpm fetch-structurizr-docs` to populate). When working on `structurizrDslWriter.ts`,
read the relevant files from that directory. If not present locally, source is:
https://github.com/structurizr/structurizr.github.io/tree/main/dsl

TypeScript library for defining C4 architecture models and generating Structurizr DSL.

## Running tasks

```sh
pnpm exec nx run c4-model:test
pnpm exec nx run c4-model:build
pnpm exec nx run c4-model:lint
```

## Architecture

- `core.ts` — Base classes: `Element`, `TechnicalElement`, `Relationship`, `Reference`, `Group`
- `model.ts` — `Model` class, `C4Module` interface, `buildModel()` two-phase loader
- `person.ts` / `softwareSystem.ts` / `container.ts` / `component.ts` — C4 element types
- `views.ts` — View definitions (system landscape, context, container, component)
- `structurizrDslWriter.ts` — Generates Structurizr DSL from a Model + Views

## C4Module pattern

Modules are defined in `c4.dsl.ts` files discovered by `buildModel()` via glob. Each exports a `c4Module`:

```ts
export const c4Module: C4Module<RootCatalog, LocalCatalog> = {
    key: 'myModule',
    registerDefinitions(model) { /* define elements, return catalog */ },
    buildRelationships(local, dependencies) { /* wire up cross-module relationships */ },
}
```

- **Phase 1**: All modules register definitions; results stored in a root catalog keyed by module key
- **Phase 2**: Each module receives its own catalog and all other modules' catalogs to build relationships
- `CatalogKeyOf` and `Dependencies` utility types ensure type-safe keys and dependency access
- See `libs/c4-model-examples` for integration tests using `buildModel()`
