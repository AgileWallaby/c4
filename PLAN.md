# C4 Viewer — Implementation Plan

## Step 1: Scaffold the App

Run the Nx generator to create the React app:

```sh
pnpm nx g @nx/react:app c4-viewer \
  --directory=apps/c4-viewer \
  --bundler=vite \
  --style=none \
  --unitTestRunner=vitest
```

Verify the following files exist after scaffolding:
- `apps/c4-viewer/src/main.tsx`
- `apps/c4-viewer/src/App.tsx`
- `apps/c4-viewer/index.html`
- `apps/c4-viewer/vite.config.ts`
- `apps/c4-viewer/project.json`

---

## Step 2: Install Runtime Dependencies

```sh
pnpm --filter c4-viewer add @xyflow/react @dagrejs/dagre
```

---

## Step 3: Install and Configure Tailwind CSS v4

```sh
pnpm --filter c4-viewer add -D tailwindcss @tailwindcss/vite
```

Update `apps/c4-viewer/vite.config.ts` to add the Tailwind plugin:

```ts
import tailwindcss from '@tailwindcss/vite';
// add to plugins array: tailwindcss()
```

Create `apps/c4-viewer/src/index.css`:

```css
@import "tailwindcss";
```

Import `index.css` in `apps/c4-viewer/src/main.tsx`.

---

## Step 4: Implement `parser/types.ts`

Create `apps/c4-viewer/src/parser/types.ts` with TypeScript interfaces that mirror the Structurizr workspace JSON schema. Only include fields the app uses:

```ts
export interface WorkspaceJson {
  name?: string;
  model: Model;
  views: Views;
  configuration?: Configuration;
}

export interface Model {
  people?: Person[];
  softwareSystems?: SoftwareSystem[];
  groups?: Group[];
  relationships?: Relationship[];
}

export interface Person {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  relationships?: Relationship[];
}

export interface SoftwareSystem {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  containers?: Container[];
  relationships?: Relationship[];
}

export interface Container {
  id: string;
  name: string;
  description?: string;
  technology?: string;
  tags?: string;
  relationships?: Relationship[];
}

export interface Group {
  id?: string;
  name: string;
  people?: Person[];
  softwareSystems?: SoftwareSystem[];
}

export interface Relationship {
  id: string;
  sourceId: string;
  destinationId: string;
  description?: string;
  technology?: string;
  tags?: string;
}

export interface Views {
  systemLandscapeViews?: StructurizrView[];
  systemContextViews?: StructurizrView[];
  containerViews?: StructurizrView[];
}

export interface StructurizrView {
  key: string;
  description?: string;
  softwareSystemId?: string;  // for context/container views
  elements?: ViewElement[];
  relationships?: ViewRelationship[];
  autoLayout?: AutoLayout;
}

export interface ViewElement {
  id: string;
  x?: number;
  y?: number;
}

export interface ViewRelationship {
  id: string;
}

export interface AutoLayout {
  rankDirection?: 'TopBottom' | 'BottomTop' | 'LeftRight' | 'RightLeft';
  rankSeparation?: number;
  nodeSeparation?: number;
}

export interface Configuration {
  styles?: Styles;
}

export interface Styles {
  elements?: ElementStyle[];
  relationships?: RelationshipStyle[];
}

export interface ElementStyle {
  tag: string;
  background?: string;
  color?: string;
  shape?: string;
  border?: string;
}

export interface RelationshipStyle {
  tag: string;
  color?: string;
  dashed?: boolean;
  thickness?: number;
}

// Internal types for the parser's element lookup map
export type ElementType = 'Person' | 'SoftwareSystem' | 'Container' | 'Group';

export interface ResolvedElement {
  id: string;
  name: string;
  description?: string;
  technology?: string;
  tags?: string;
  type: ElementType;
  isExternal: boolean;          // true if tagged "External"
  parentSystemId?: string;      // for Container elements
  groupId?: string;             // set if this element belongs to a group
}
```

---

## Step 5: Implement `parser/workspaceJsonParser.ts`

Create `apps/c4-viewer/src/parser/workspaceJsonParser.ts`.

This is a pure TS module (no React). It exports two functions:

### `getAllViews(workspace: WorkspaceJson): StructurizrView[]`
Returns a flat array of all views from all three view type arrays, used to populate the dropdown.

### `parseView(workspace: WorkspaceJson, viewKey: string): { nodes: Node[], edges: Edge[] }`
Main parsing function — returns React Flow nodes and edges.

**Implementation steps inside `parseView`:**

1. **Build element lookup map** (`Map<id, ResolvedElement>`):
   - Walk `model.people[]` → type `'Person'`
   - Walk `model.softwareSystems[]` → type `'SoftwareSystem'`
   - Walk each `softwareSystem.containers[]` → type `'Container'`, set `parentSystemId`
   - Walk `model.groups[]` and `group.people[]` / `group.softwareSystems[]` → set `groupId` on members
   - Determine `isExternal` by checking if `tags` includes `"External"`

2. **Find the selected view** across all three view arrays.

3. **Build group nodes** (type `'groupNode'`):
   - From the view's `elements[]`, find which resolved elements have a `groupId`
   - For each distinct groupId, create a group parent node with `type: 'groupNode'`

4. **Build element nodes**:
   - For each entry in `view.elements[]`, look up the resolved element
   - Map type → React Flow node type: `'personNode'`, `'softwareSystemNode'`, `'containerNode'`
   - If element has a `groupId` and a group node was created, set `parentId` and `extent: 'parent'`
   - Carry `x`/`y` from the view element if present and non-zero

5. **Build edges**:
   - For each `view.relationships[]`, find the relationship by ID across all elements in the lookup map
   - Build a React Flow edge with `type: 'relationshipEdge'` and `data: { description, technology }`

6. **Determine layout strategy**:
   - If any node has a non-zero `x`/`y` from the JSON → use embedded positions
   - Otherwise → call `computeLayout(nodes, edges, view.autoLayout)` from `layoutEngine.ts`

7. Return `{ nodes, edges }`.

---

## Step 6: Implement `parser/layoutEngine.ts`

Create `apps/c4-viewer/src/parser/layoutEngine.ts`.

Wraps `@dagrejs/dagre`:

```ts
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';
import type { AutoLayout } from './types';

const NODE_WIDTH = 172;
const NODE_HEIGHT = 80;
const GROUP_PADDING = 40;

export function computeLayout(
  nodes: Node[],
  edges: Edge[],
  autoLayout?: AutoLayout
): Node[] { ... }
```

**Two-pass layout for groups:**

1. **Pass 1** — lay out non-group (leaf) nodes only:
   - Create a dagre graph, add only non-group nodes + all edges between them
   - Run `dagre.layout(g)`
   - Apply computed `{x, y}` to each leaf node

2. **Pass 2** — size group (parent) nodes to wrap their children:
   - For each group node, find its children (nodes with matching `parentId`)
   - Compute bounding box of children positions + `NODE_WIDTH`/`NODE_HEIGHT`
   - Set group node `position` and `style.width`/`style.height` with padding

**rankDirection mapping:**
```
TopBottom  → 'TB'
BottomTop  → 'BT'
LeftRight  → 'LR'
RightLeft  → 'RL'
(default)  → 'TB'
```

---

## Step 7: Build `WorkspaceLoader` Component

Create `apps/c4-viewer/src/components/WorkspaceLoader.tsx`.

Props: `onWorkspaceLoaded: (workspace: WorkspaceJson) => void`

Features:
- Full-page centered drop zone
- `onDragOver` / `onDrop` handlers — read the dropped `.json` file, `JSON.parse`, call `onWorkspaceLoaded`
- File `<input type="file" accept=".json">` as fallback picker
- Error state: show a message if the file fails to parse
- Styling: large dashed border box, icon, instructional text, "or click to browse" link — all via Tailwind

---

## Step 8: Build `ViewSelector` Component

Create `apps/c4-viewer/src/components/ViewSelector.tsx`.

Props:
```ts
views: StructurizrView[]
selectedKey: string
onChange: (key: string) => void
```

Renders a `<select>` element. Each `<option>` has `value={view.key}` and displays `view.key` (append ` — ${view.description}` if description is present).

---

## Step 9: Build `Header` Component

Create `apps/c4-viewer/src/components/Header.tsx`.

Props:
```ts
workspaceName: string
views: StructurizrView[]
selectedViewKey: string
onViewChange: (key: string) => void
onReset: () => void   // clears the loaded workspace
```

Renders:
- Left: workspace name/title
- Center/right: `<ViewSelector>`
- Far right: "Upload new" button that calls `onReset`

---

## Step 10: Build Custom Node Components

Create each file under `apps/c4-viewer/src/components/nodes/`.

### Shared node `data` shape:
```ts
interface C4NodeData {
  label: string;
  elementType: string;     // e.g. "Software System", "Container"
  description?: string;
  technology?: string;
  isExternal: boolean;
}
```

### `PersonNode.tsx`
- Blue fill (`isExternal` → grey fill)
- Person silhouette icon area at top (SVG or emoji)
- Name in bold, `[Person]` label below in smaller text
- Optional description

### `SoftwareSystemNode.tsx`
- Blue fill (`isExternal` → grey fill)
- Name in bold, `[Software System]` below
- Optional description

### `ContainerNode.tsx`
- Blue fill (`isExternal` → grey fill)
- Name in bold, `[Container]` + technology below
- Optional description

### `GroupNode.tsx`
- Transparent fill, dashed border
- Group name label at top-left corner
- `style` prop used to set dynamic width/height from layout engine

All node components register `<Handle>` positions (at least `Position.Top` and `Position.Bottom`, or all four sides) to allow edges to connect.

---

## Step 11: Build `RelationshipEdge` Custom Edge

Create `apps/c4-viewer/src/components/nodes/RelationshipEdge.tsx`.

Props (standard React Flow edge props):
```ts
data: { description?: string; technology?: string }
```

- Use `getSmoothStepPath` or `getBezierPath` from `@xyflow/react`
- Render an `<EdgeLabelRenderer>` with two lines:
  - Line 1: `description` (if present)
  - Line 2: `[technology]` in smaller/italic text (if present)
- Render an arrowhead marker

---

## Step 12: Build `DiagramCanvas` Component

Create `apps/c4-viewer/src/components/DiagramCanvas.tsx`.

Props:
```ts
nodes: Node[]
edges: Edge[]
```

- Import `ReactFlow`, `Controls`, `Background`, `MiniMap` from `@xyflow/react`
- Register custom node types:
  ```ts
  const nodeTypes = {
    personNode: PersonNode,
    softwareSystemNode: SoftwareSystemNode,
    containerNode: ContainerNode,
    groupNode: GroupNode,
  };
  ```
- Register custom edge types:
  ```ts
  const edgeTypes = { relationshipEdge: RelationshipEdge };
  ```
- Set `fitView` on the `<ReactFlow>` component
- Import React Flow's CSS: `import '@xyflow/react/dist/style.css'`
- Wrap in a `div` with `h-full w-full`

---

## Step 13: Wire Up `App.tsx`

Rewrite `apps/c4-viewer/src/App.tsx` with the following state:

```ts
const [workspace, setWorkspace] = useState<WorkspaceJson | null>(null);
const [selectedViewKey, setSelectedViewKey] = useState<string>('');
```

Logic:
- When `workspace` changes, auto-select the first available view key
- Derive `views = getAllViews(workspace)` and `{ nodes, edges } = parseView(workspace, selectedViewKey)` from state
- Render:
  - If no workspace → `<WorkspaceLoader onWorkspaceLoaded={...} />`
  - Otherwise → `<Header .../>` + `<DiagramCanvas nodes={nodes} edges={edges} />`

---

## Step 14: Register Custom Node Types Map (avoid re-creation)

Define `nodeTypes` and `edgeTypes` **outside** the `App` or `DiagramCanvas` component body (module-level constants) to prevent React Flow from re-mounting nodes on every render.

---

## Step 15: Write Parser Unit Tests

Create `apps/c4-viewer/src/parser/workspaceJsonParser.spec.ts`.

Create a fixture file `apps/c4-viewer/src/parser/__fixtures__/sample-workspace.json` containing a minimal but realistic workspace JSON with:
- 1 System Landscape view
- 1 System Context view
- 1 Container view
- Mix of Person, SoftwareSystem, Container elements
- At least one Group
- At least one External element
- Several relationships
- One view with embedded positions, one without (to trigger auto-layout)

**Tests to write:**

1. `getAllViews` returns all views across all types
2. `parseView` with landscape view → correct node types and counts
3. `parseView` with container view → containers appear as nodes
4. `parseView` group membership → group node created, children have `parentId`
5. `parseView` external element → `isExternal: true` in node data
6. `parseView` embedded positions → nodes get those positions
7. `parseView` no positions → nodes get positions from dagre (all non-zero after layout)
8. `parseView` edges → correct `source`/`target` IDs

---

## Step 16: Smoke Test & Visual Verification

1. Run `pnpm nx run c4-viewer:serve`
2. Export a workspace JSON from Structurizr (or use the fixture from Step 15)
3. Upload the file and verify:
   - All views appear in the dropdown
   - Each view renders correct nodes and edges
   - Groups visually contain their member nodes
   - Relationship labels appear on edges
   - Pan, zoom, and fit-to-view work
   - "Upload new" resets to the loader screen
4. Test edge cases:
   - Workspace with a single view (no dropdown needed but should still work)
   - View with all positions embedded → no dagre call
   - View with no positions → dagre auto-layout runs, nodes do not overlap

---

## Step 17: Lint & Build Check

```sh
pnpm nx run c4-viewer:lint
pnpm nx run c4-viewer:test
pnpm nx run c4-viewer:build
```

Fix any lint errors or type errors before considering the implementation complete.

---

## Completion Checklist

- [x] App scaffolded and Tailwind configured
- [x] Dependencies installed (`@xyflow/react`, `@dagrejs/dagre`, `tailwindcss`)
- [x] `parser/types.ts` — workspace JSON interfaces
- [x] `parser/workspaceJsonParser.ts` — ID map, node/edge building, layout selection
- [x] `parser/layoutEngine.ts` — dagre two-pass layout
- [ ] `WorkspaceLoader` — drag-and-drop / file picker
- [ ] `Header` + `ViewSelector`
- [ ] `PersonNode`, `SoftwareSystemNode`, `ContainerNode`, `GroupNode`
- [ ] `RelationshipEdge`
- [ ] `DiagramCanvas` — React Flow canvas with all custom types registered
- [ ] `App.tsx` — state wiring
- [ ] Parser unit tests with fixture
- [ ] `lint`, `test`, `build` all pass
