# C4 Viewer — Specification

## Overview
A web-based, read-only viewer for C4 architecture models. Users upload a Structurizr workspace JSON file and explore diagrams interactively via a node-based canvas. A dropdown allows switching between the views contained in the workspace.

## Tech Stack
| Concern | Technology |
|---|---|
| Framework | React 19 + Vite |
| Monorepo tooling | Nx (existing workspace, pnpm) |
| Diagram canvas | `@xyflow/react` (React Flow v12) |
| Auto-layout | `@dagrejs/dagre` |
| Styling | Tailwind CSS v4 |

## App Location
`apps/c4-viewer/` in the monorepo.

### Scaffolding Command
```sh
pnpm nx g @nx/react:app c4-viewer \
  --directory=apps/c4-viewer \
  --bundler=vite \
  --style=none \
  --unitTestRunner=vitest
```
Then configure Tailwind CSS per Vite/React conventions.

---

## Feature Scope (MVP)

### In Scope
- File upload area (drag-and-drop or file picker) for Structurizr workspace JSON (`.json`)
- Parse and render these view types: **System Landscape**, **System Context**, **Container**
- View selector dropdown — switch between all views present in the workspace
- Interactive React Flow canvas: pan, zoom, fit-to-view
- Node types: Person, Software System, Container, Group (as parent node)
- Edge type: Relationship (with description/technology label)
- Layout: use embedded positions from JSON when present; fall back to dagre auto-layout
- Read-only (no editing, no saving)

### Out of Scope (post-MVP)
- Component views, Dynamic views, Deployment views, Filtered views
- DSL file parsing
- Persisting uploads or layouts across page refreshes
- Manual drag-to-reposition with saved state
- Authentication / multi-user
- Backend / server-side processing

---

## Input Format: Structurizr Workspace JSON

The app accepts the JSON format exported by Structurizr (File → Export → Workspace as JSON). Key sections:

### `model`
```
model.people[]               → Person elements
model.softwareSystems[]      → SoftwareSystem elements
  .containers[]              → Container elements (nested)
model.groups[]               → Logical groups (can be nested)
<any element>.relationships[] → Relationships (also model-level)
```

### `views`
```
views.systemLandscapeViews[]
views.systemContextViews[]
views.containerViews[]

Each view:
  .key          string         unique identifier
  .description  string?        human-readable label
  .elements[]   {id, x?, y?}  elements to include + optional positions
  .relationships[] {id}       relationships to include
  .autoLayout   {rankDirection, rankSeparation, nodeSeparation}?
```

### `configuration.styles`
```
configuration.styles.elements[]      → element styles (color, shape, border, etc.)
configuration.styles.relationships[] → relationship styles
```

---

## React Flow Data Model

The parser converts workspace JSON + a selected view key into React Flow's `{ nodes, edges }`.

### Node Types

| C4 Element | React Flow type | Notes |
|---|---|---|
| Person | `personNode` | Box with person-icon area |
| SoftwareSystem | `softwareSystemNode` | Filled box |
| Container | `containerNode` | Box, typically within parent system |
| Group | `groupNode` | Parent node containing member nodes |

- **External** elements (not owned by the view's subject system) receive a distinct visual treatment (grey vs blue)
- Groups use React Flow's parent node feature — member nodes have `parentId` set and `extent: 'parent'`

### Edge Type

| C4 Concept | React Flow type | Label |
|---|---|---|
| Relationship | `relationshipEdge` | `description` + `[technology]` as secondary line |

---

## C4 Visual Conventions

Nodes follow standard C4 diagram conventions:

| Element | Fill color | Border | Icon area |
|---|---|---|---|
| Person | Blue | Solid | Person silhouette |
| External Person | Grey | Solid | Person silhouette |
| Software System | Blue | Solid | — |
| External Software System | Grey | Solid | — |
| Container | Blue | Solid | — |
| External Container | Grey | Solid | — |
| Group | Transparent | Dashed | Label at top |

Element type labels (e.g. `[Software System]`, `[Container]`) shown below the element name in smaller text, following C4 notation.

---

## Layout Strategy

1. **Embedded positions** — If the workspace JSON's view `elements[]` includes non-zero `x`/`y` values, use them directly as React Flow node positions.
2. **Dagre auto-layout** — If positions are absent or all zero, run `@dagrejs/dagre` to compute a hierarchical layout. Use `autoLayout.rankDirection` from the view if available (TopBottom → `'TB'`, LeftRight → `'LR'`, etc.), defaulting to `'TB'`.

Group/parent nodes require a two-pass layout: lay out children first, then size the parent to wrap them.

---

## Parsing Module: `parser/workspaceJsonParser.ts`

A pure TypeScript module (no React) responsible for:
1. Building an ID→element lookup map from all model sections
2. Determining element type from the model hierarchy (position under `people`, `softwareSystems`, `containers`) or tags
3. Filtering elements and relationships for the selected view
4. Building group parent nodes and assigning `parentId` to member nodes
5. Computing layout (positions or dagre)
6. Returning `{ nodes: Node[], edges: Edge[] }` for React Flow

### `parser/types.ts`
TypeScript interfaces mirroring the Structurizr workspace JSON schema (just the fields the app uses).

### `parser/layoutEngine.ts`
Wraps `@dagrejs/dagre` to accept a list of nodes + edges and return nodes annotated with `position: {x, y}`.

---

## Component Architecture

```
App
├── WorkspaceLoader          # Shown when no workspace loaded
│   └── drag-and-drop zone / file picker
├── Header                   # Always visible once workspace loaded
│   ├── workspace name/title
│   └── ViewSelector         # <select> dropdown of view keys
└── DiagramCanvas            # Main diagram area
    └── <ReactFlow>
        ├── PersonNode
        ├── SoftwareSystemNode
        ├── ContainerNode
        ├── GroupNode          (parent node)
        └── RelationshipEdge
        └── <Controls>         (zoom in/out, fit view)
        └── <Background>       (dot grid)
        └── <MiniMap>          (optional)
```

---

## Proposed File Structure

```
apps/c4-viewer/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── WorkspaceLoader.tsx
│   │   ├── Header.tsx
│   │   ├── ViewSelector.tsx
│   │   ├── DiagramCanvas.tsx
│   │   └── nodes/
│   │       ├── PersonNode.tsx
│   │       ├── SoftwareSystemNode.tsx
│   │       ├── ContainerNode.tsx
│   │       ├── GroupNode.tsx
│   │       └── RelationshipEdge.tsx
│   ├── parser/
│   │   ├── workspaceJsonParser.ts
│   │   ├── layoutEngine.ts
│   │   └── types.ts
│   └── index.css              # Tailwind entry point
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── project.json
├── tsconfig.json
└── tsconfig.app.json
```

---

## Nx Targets

| Target | Command | Description |
|---|---|---|
| `serve` | `pnpm nx run c4-viewer:serve` | Vite dev server |
| `build` | `pnpm nx run c4-viewer:build` | Production build |
| `lint` | `pnpm nx run c4-viewer:lint` | ESLint |
| `test` | `pnpm nx run c4-viewer:test` | Vitest unit tests |

---

## Key Dependencies

### Runtime
```
@xyflow/react       ^12.x   React Flow canvas
@dagrejs/dagre      ^1.x    Auto-layout algorithm
react               ^19.x
react-dom           ^19.x
```

### Dev
```
tailwindcss         ^4.x
@vitejs/plugin-react ^4.x
@types/dagre        ^0.7.x
vitest              (already in workspace)
```

---

## Open Questions / Future Considerations
- Apply element/relationship styles from `configuration.styles` in the workspace JSON (colors, shapes)?
- Support Component view type?
- Persist uploaded workspace in `localStorage` across refreshes?
- Allow manual node dragging (with or without persisted positions)?
- Export/share a view as PNG/SVG?

---

## Implementation Steps

1. Scaffold app with `nx g @nx/react:app`
2. Install and configure Tailwind CSS
3. Install `@xyflow/react` and `@dagrejs/dagre`
4. Implement `parser/types.ts` — workspace JSON TypeScript interfaces
5. Implement `parser/workspaceJsonParser.ts` — ID resolution, node/edge building
6. Implement `parser/layoutEngine.ts` — dagre wrapper
7. Build `WorkspaceLoader` component (file input + drag-and-drop)
8. Build `ViewSelector` dropdown
9. Implement custom node components (PersonNode, SoftwareSystemNode, ContainerNode, GroupNode)
10. Implement `RelationshipEdge` custom edge
11. Assemble `DiagramCanvas` with React Flow
12. Wire up `App` with state: loaded workspace JSON + selected view key

---

## Verification / Testing
- Unit test the parser with a sample workspace JSON fixture (covering each view type)
- Manual test: export a workspace JSON from Structurizr, upload to the app, verify all views render
- Visual spot-check: elements appear with correct labels, relationships show correct labels, groups contain correct members
- Edge cases: workspace with no views, workspace with a single view, view with no layout positions (forces auto-layout)
