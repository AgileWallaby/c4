## 2.3.0 (2026-03-06)

### 🩹 Fixes

- reenable cjs ([6ba3471](https://github.com/AgileWallaby/c4/commit/6ba3471))

### ❤️ Thank You

- James Webster @jimmcslim

## 2.2.0 (2026-03-06)

### 🚀 Features

- ⚠️  migrate to ESM, replace Jest with Vitest ([61f3715](https://github.com/AgileWallaby/c4/commit/61f3715))
- ⚠️  proper bundling for esm ([edd6a13](https://github.com/AgileWallaby/c4/commit/edd6a13))
- introduce archetype support ([cb9bb9e](https://github.com/AgileWallaby/c4/commit/cb9bb9e))
- demonstrate the use of archetypes ([f40e16d](https://github.com/AgileWallaby/c4/commit/f40e16d))
- implement build model with explicit modules and update tests ([967a0a0](https://github.com/AgileWallaby/c4/commit/967a0a0))

### 🩹 Fixes

- correct location for archetypes ([9693222](https://github.com/AgileWallaby/c4/commit/9693222))

### ⚠️  Breaking Changes

- proper bundling for esm  ([edd6a13](https://github.com/AgileWallaby/c4/commit/edd6a13))
- migrate to ESM, replace Jest with Vitest  ([61f3715](https://github.com/AgileWallaby/c4/commit/61f3715))
  package is now ESM-only; consumers must use import instead of require
  - publish @agilewallaby/c4-model as ESM (type: module), fixing ERR_REQUIRE_ESM
    caused by change-case v5 (ESM-only) dependency
  - replace Jest + ts-jest with Vitest (native ESM, no transpilation hacks)
  - switch generate-diagrams from ts-node to tsx
  - bump tsconfig target to es2022, moduleResolution to bundler
  - add exports map to package.json
  Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>

### ❤️ Thank You

- Claude Sonnet 4.6
- James Webster @jimmcslim

## 1.1.0 (2026-03-05)

### 🚀 Features

- add RootCatalog and update system modules for improved relationships ([c5f72a0](https://github.com/AgileWallaby/c4/commit/c5f72a0))
- add initial documentation for c4-model library and its architecture ([1c97160](https://github.com/AgileWallaby/c4/commit/1c97160))
- add Structurizr DSL documentation and fetching script ([928bc78](https://github.com/AgileWallaby/c4/commit/928bc78))
- add diagram generation functionality ([174392d](https://github.com/AgileWallaby/c4/commit/174392d))
- added generate-diagrams target ([d4c01c2](https://github.com/AgileWallaby/c4/commit/d4c01c2))

### ❤️ Thank You

- James Webster @jimmcslim