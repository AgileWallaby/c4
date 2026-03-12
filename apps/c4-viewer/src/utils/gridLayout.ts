import type { Node } from "@xyflow/react";

export const CELL_WIDTH = 240;
export const CELL_HEIGHT = 160;
export const NODE_WIDTH = 176;
export const NODE_HEIGHT = 80;
export const GROUP_PADDING = 40;
export const MARGIN = 20; // px — max visible margin beyond grid at minZoom

/** Top-level non-group nodes (original definition, kept for reference). */
export function isLeafTopLevel(node: Node): boolean {
  return node.type !== "groupNode" && !node.parentId;
}

/** Any non-group node regardless of depth — these all get grid cells. */
export function isGridNode(node: Node): boolean {
  return node.type !== "groupNode";
}

export function computeDefaultGridDimensions(leafCount: number): {
  rows: number;
  cols: number;
} {
  if (leafCount <= 0) return { rows: 1, cols: 1 };
  const cols = Math.ceil(Math.sqrt(leafCount));
  const rows = Math.ceil(leafCount / cols);
  return { rows, cols };
}

export function cellCenter(
  row: number,
  col: number,
  cellWidth = CELL_WIDTH,
  cellHeight = CELL_HEIGHT,
): { x: number; y: number } {
  return {
    x: col * cellWidth + (cellWidth - NODE_WIDTH) / 2,
    y: row * cellHeight + (cellHeight - NODE_HEIGHT) / 2,
  };
}

export function positionToCell(
  x: number,
  y: number,
  rows: number,
  cols: number,
  cellWidth = CELL_WIDTH,
  cellHeight = CELL_HEIGHT,
): { row: number; col: number } | null {
  const cx = x + NODE_WIDTH / 2;
  const cy = y + NODE_HEIGHT / 2;

  const rawCol = Math.round((cx - cellWidth / 2) / cellWidth);
  const rawRow = Math.round((cy - cellHeight / 2) / cellHeight);

  if (rawCol < 0 || rawRow < 0 || rawCol >= cols || rawRow >= rows) {
    return null;
  }

  return {
    col: Math.min(Math.max(rawCol, 0), cols - 1),
    row: Math.min(Math.max(rawRow, 0), rows - 1),
  };
}

/**
 * Returns a copy of nodes where each child node's position is resolved to
 * absolute canvas coordinates (parent.position + child.position).
 * Group nodes and top-level nodes are returned with their position unchanged.
 */
export function resolveAbsolutePositions(nodes: Node[]): Node[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return nodes.map((n) => {
    if (!n.parentId) return n;
    const parent = nodeMap.get(n.parentId);
    if (!parent) return n;
    return {
      ...n,
      position: {
        x: parent.position.x + n.position.x,
        y: parent.position.y + n.position.y,
      },
    };
  });
}

/**
 * Recomputes each group node's position and size so it wraps its children
 * with GROUP_PADDING, then converts children back to positions relative to
 * their (updated) parent.
 *
 * Assumes child nodes currently hold ABSOLUTE canvas positions.
 */
export function recomputeGroupSizes(
  nodes: Node[],
  cellWidth = CELL_WIDTH,
  cellHeight = CELL_HEIGHT,
): Node[] {
  void cellWidth;
  void cellHeight;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Compute absolute positions for all nodes (children may be relative).
  const absPos = new Map<string, { x: number; y: number }>();
  for (const n of nodes) {
    if (!n.parentId) {
      absPos.set(n.id, { x: n.position.x, y: n.position.y });
    } else {
      const parent = nodeMap.get(n.parentId);
      const pPos = parent
        ? (absPos.get(n.parentId) ?? parent.position)
        : { x: 0, y: 0 };
      absPos.set(n.id, {
        x: pPos.x + n.position.x,
        y: pPos.y + n.position.y,
      });
    }
  }

  const result = new Map(nodes.map((n) => [n.id, { ...n }]));

  for (const groupNode of nodes.filter((n) => n.type === "groupNode")) {
    const children = nodes.filter(
      (n) => n.parentId === groupNode.id && n.type !== "groupNode",
    );
    if (children.length === 0) continue;

    const childAbs = children.map((c) => ({
      id: c.id,
      pos: absPos.get(c.id)!,
    }));

    const minX = Math.min(...childAbs.map((c) => c.pos.x));
    const minY = Math.min(...childAbs.map((c) => c.pos.y));
    const maxX = Math.max(...childAbs.map((c) => c.pos.x + NODE_WIDTH));
    const maxY = Math.max(...childAbs.map((c) => c.pos.y + NODE_HEIGHT));

    const newGroupX = minX - GROUP_PADDING;
    const newGroupY = minY - GROUP_PADDING;
    const newGroupW = maxX - minX + GROUP_PADDING * 2;
    const newGroupH = maxY - minY + GROUP_PADDING * 2;

    result.set(groupNode.id, {
      ...result.get(groupNode.id)!,
      position: { x: newGroupX, y: newGroupY },
      style: {
        ...(result.get(groupNode.id)!.style ?? {}),
        width: newGroupW,
        height: newGroupH,
      },
    });

    for (const { id, pos } of childAbs) {
      result.set(id, {
        ...result.get(id)!,
        position: { x: pos.x - newGroupX, y: pos.y - newGroupY },
      });
    }
  }

  return nodes.map((n) => result.get(n.id) ?? n);
}

/**
 * Builds an occupancy map from nodes that already have absolute positions.
 * Pass the output of resolveAbsolutePositions when child nodes are involved.
 */
export function buildOccupancyMap(
  nodes: Node[],
  rows: number,
  cols: number,
  cellWidth = CELL_WIDTH,
  cellHeight = CELL_HEIGHT,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const node of nodes) {
    if (!isGridNode(node)) continue;
    const cell = positionToCell(
      node.position.x,
      node.position.y,
      rows,
      cols,
      cellWidth,
      cellHeight,
    );
    if (cell) {
      map.set(`${cell.row},${cell.col}`, node.id);
    }
  }
  return map;
}

export function computeMinZoom(containerW: number, containerH: number): number {
  if (containerW <= 0 || containerH <= 0) return 0.5;
  return Math.max(
    1 - (2 * MARGIN) / containerW,
    1 - (2 * MARGIN) / containerH,
  );
}

/**
 * Remaps nodes to equivalent cells in new cell geometry while preserving
 * logical (row, col) positions. Preserves user-rearranged node positions
 * across container resizes.
 */
export function rescaleToNewCellSizes(
  nodes: Node[],
  rows: number,
  cols: number,
  oldCellWidth: number,
  oldCellHeight: number,
  newCellWidth: number,
  newCellHeight: number,
): Node[] {
  if (oldCellWidth <= 0 || oldCellHeight <= 0) return nodes;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const staged = nodes.map((node) => {
    if (node.type === "groupNode") {
      // Reset group position; recomputeGroupSizes will recompute from children.
      return { ...node, position: { x: 0, y: 0 } };
    }

    // Compute absolute position in old grid.
    const parent = node.parentId ? nodeMap.get(node.parentId) : undefined;
    const absX = (parent?.position.x ?? 0) + node.position.x;
    const absY = (parent?.position.y ?? 0) + node.position.y;

    let cell = positionToCell(absX, absY, rows, cols, oldCellWidth, oldCellHeight);
    if (!cell) {
      // Clamp off-grid nodes to nearest valid cell.
      const row = Math.min(rows - 1, Math.max(0, Math.round(absY / oldCellHeight)));
      const col = Math.min(cols - 1, Math.max(0, Math.round(absX / oldCellWidth)));
      cell = { row, col };
    }

    return {
      ...node,
      position: cellCenter(cell.row, cell.col, newCellWidth, newCellHeight),
    };
  });

  return recomputeGroupSizes(staged, newCellWidth, newCellHeight);
}

/**
 * Places every non-group node (top-level or child) on the grid sequentially,
 * then recomputes group bounds from the resulting absolute positions.
 */
export function applyInitialGridLayout(
  nodes: Node[],
  _rows: number,
  cols: number,
  cellWidth = CELL_WIDTH,
  cellHeight = CELL_HEIGHT,
): Node[] {
  let index = 0;

  // Step 1: assign absolute grid positions to all non-group nodes.
  const absPos = new Map<string, { x: number; y: number }>();
  const staged = nodes.map((node) => {
    if (node.type === "groupNode") {
      return { ...node, draggable: false };
    }
    const row = Math.floor(index / cols);
    const col = index % cols;
    index++;
    const pos = cellCenter(row, col, cellWidth, cellHeight);
    absPos.set(node.id, pos);
    return {
      ...node,
      position: pos, // temporarily absolute; will be made relative below
      draggable: true,
      extent: undefined as Node["extent"],
      expandParent: false,
    };
  });

  // Step 2: recompute group sizes and convert child positions to relative.
  return recomputeGroupSizes(staged, cellWidth, cellHeight);
}
