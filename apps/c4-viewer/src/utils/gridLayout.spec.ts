import { describe, it, expect } from "vitest";
import type { Node } from "@xyflow/react";
import {
  computeDefaultGridDimensions,
  cellCenter,
  positionToCell,
  applyInitialGridLayout,
  buildOccupancyMap,
  resolveAbsolutePositions,
  recomputeGroupSizes,
  isGridNode,
  CELL_WIDTH,
  CELL_HEIGHT,
  NODE_WIDTH,
  NODE_HEIGHT,
  GROUP_PADDING,
} from "./gridLayout";

function makeNode(
  id: string,
  x: number,
  y: number,
  type = "softwareSystemNode",
  parentId?: string,
): Node {
  return {
    id,
    type,
    position: { x, y },
    data: { label: id },
    ...(parentId ? { parentId } : {}),
  };
}

function makeGroup(id: string, x: number, y: number): Node {
  return {
    id,
    type: "groupNode",
    position: { x, y },
    data: { label: id },
    style: { width: 200, height: 200 },
  };
}

describe("computeDefaultGridDimensions", () => {
  it("returns {1,1} for 0 nodes", () => {
    expect(computeDefaultGridDimensions(0)).toEqual({ rows: 1, cols: 1 });
  });

  it("returns {1,1} for negative count", () => {
    expect(computeDefaultGridDimensions(-1)).toEqual({ rows: 1, cols: 1 });
  });

  it("returns {1,1} for 1 node", () => {
    expect(computeDefaultGridDimensions(1)).toEqual({ rows: 1, cols: 1 });
  });

  it("returns {2,2} for 4 nodes", () => {
    expect(computeDefaultGridDimensions(4)).toEqual({ rows: 2, cols: 2 });
  });

  it("returns {2,3} for 5 nodes", () => {
    expect(computeDefaultGridDimensions(5)).toEqual({ rows: 2, cols: 3 });
  });

  it("returns {3,3} for 9 nodes", () => {
    expect(computeDefaultGridDimensions(9)).toEqual({ rows: 3, cols: 3 });
  });
});

describe("isGridNode", () => {
  it("returns true for leaf top-level nodes", () => {
    expect(isGridNode(makeNode("a", 0, 0))).toBe(true);
  });

  it("returns true for child nodes (have parentId)", () => {
    expect(isGridNode(makeNode("child", 0, 0, "containerNode", "g1"))).toBe(
      true,
    );
  });

  it("returns false for group nodes", () => {
    expect(isGridNode(makeGroup("g", 0, 0))).toBe(false);
  });
});

describe("cellCenter", () => {
  it("returns correct position for (0,0)", () => {
    expect(cellCenter(0, 0)).toEqual({
      x: (CELL_WIDTH - NODE_WIDTH) / 2,
      y: (CELL_HEIGHT - NODE_HEIGHT) / 2,
    });
  });

  it("returns x=32, y=40 for (0,0) given default constants", () => {
    expect(cellCenter(0, 0)).toEqual({ x: 32, y: 40 });
  });

  it("round-trips with positionToCell", () => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const pos = cellCenter(r, c);
        expect(positionToCell(pos.x, pos.y, 3, 3)).toEqual({
          row: r,
          col: c,
        });
      }
    }
  });
});

describe("positionToCell", () => {
  it("round-trips with cellCenter", () => {
    const pos = cellCenter(1, 2);
    expect(positionToCell(pos.x, pos.y, 3, 4)).toEqual({ row: 1, col: 2 });
  });

  it("returns null for position far out of bounds (negative col)", () => {
    expect(positionToCell(-500, 0, 3, 3)).toBeNull();
  });

  it("returns null for position far out of bounds (negative row)", () => {
    expect(positionToCell(0, -500, 3, 3)).toBeNull();
  });

  it("returns null for position beyond grid cols", () => {
    const x = cellCenter(0, 5).x;
    expect(positionToCell(x, cellCenter(0, 0).y, 3, 3)).toBeNull();
  });

  it("returns null for position beyond grid rows", () => {
    const y = cellCenter(5, 0).y;
    expect(positionToCell(cellCenter(0, 0).x, y, 3, 3)).toBeNull();
  });
});

describe("resolveAbsolutePositions", () => {
  it("leaves top-level nodes unchanged", () => {
    const nodes = [makeNode("a", 10, 20)];
    expect(resolveAbsolutePositions(nodes)[0].position).toEqual({
      x: 10,
      y: 20,
    });
  });

  it("resolves child node position to absolute", () => {
    const group = makeGroup("g", 100, 200);
    const child = makeNode("c", 50, 60, "containerNode", "g");
    const result = resolveAbsolutePositions([group, child]);
    expect(result.find((n) => n.id === "c")!.position).toEqual({
      x: 150,
      y: 260,
    });
  });

  it("leaves group nodes at their own position", () => {
    const group = makeGroup("g", 100, 200);
    const result = resolveAbsolutePositions([group]);
    expect(result[0].position).toEqual({ x: 100, y: 200 });
  });
});

describe("recomputeGroupSizes", () => {
  it("sets group position and size to wrap its children with padding", () => {
    // Child at absolute (32, 40) = cellCenter(0,0)
    const group = makeGroup("g", 0, 0);
    const child = { ...makeNode("c", 32, 40, "containerNode", "g") };
    // Child position here is ABSOLUTE (as set by applyInitialGridLayout step 1)
    const result = recomputeGroupSizes([group, child]);
    const updatedGroup = result.find((n) => n.id === "g")!;
    expect(updatedGroup.position).toEqual({
      x: 32 - GROUP_PADDING,
      y: 40 - GROUP_PADDING,
    });
    expect(updatedGroup.style?.width).toBe(NODE_WIDTH + GROUP_PADDING * 2);
    expect(updatedGroup.style?.height).toBe(NODE_HEIGHT + GROUP_PADDING * 2);
  });

  it("converts child position to relative after recomputing group", () => {
    const group = makeGroup("g", 0, 0);
    const child = { ...makeNode("c", 32, 40, "containerNode", "g") };
    const result = recomputeGroupSizes([group, child]);
    const updatedChild = result.find((n) => n.id === "c")!;
    // After group moves to (32-40, 40-40) = (-8, 0), child rel = (32-(-8), 40-0) = (40, 40)
    expect(updatedChild.position).toEqual({ x: GROUP_PADDING, y: GROUP_PADDING });
  });

  it("leaves groups with no children unchanged", () => {
    const group = makeGroup("g", 50, 60);
    const result = recomputeGroupSizes([group]);
    expect(result[0].position).toEqual({ x: 50, y: 60 });
  });

  it("wraps multiple children correctly", () => {
    const group = makeGroup("g", 0, 0);
    const c1 = { ...makeNode("c1", cellCenter(0, 0).x, cellCenter(0, 0).y, "containerNode", "g") };
    const c2 = { ...makeNode("c2", cellCenter(0, 1).x, cellCenter(0, 1).y, "containerNode", "g") };
    const result = recomputeGroupSizes([group, c1, c2]);
    const updatedGroup = result.find((n) => n.id === "g")!;
    // Should span from c1's x to c2's x+width
    const expectedWidth = cellCenter(0, 1).x + NODE_WIDTH - cellCenter(0, 0).x + GROUP_PADDING * 2;
    expect(updatedGroup.style?.width).toBe(expectedWidth);
  });
});

describe("applyInitialGridLayout", () => {
  it("places top-level nodes left-to-right, top-to-bottom", () => {
    const nodes = [
      makeNode("a", 0, 0),
      makeNode("b", 0, 0),
      makeNode("c", 0, 0),
      makeNode("d", 0, 0),
    ];
    const result = applyInitialGridLayout(nodes, 2, 2);
    expect(result.find((n) => n.id === "a")!.position).toEqual(
      cellCenter(0, 0),
    );
    expect(result.find((n) => n.id === "b")!.position).toEqual(
      cellCenter(0, 1),
    );
    expect(result.find((n) => n.id === "c")!.position).toEqual(
      cellCenter(1, 0),
    );
    expect(result.find((n) => n.id === "d")!.position).toEqual(
      cellCenter(1, 1),
    );
  });

  it("sets draggable=false on group nodes", () => {
    const nodes = [makeGroup("g", 0, 0)];
    const result = applyInitialGridLayout(nodes, 2, 2);
    expect(result[0].draggable).toBe(false);
  });

  it("sets draggable=true on child nodes", () => {
    const group = makeGroup("g", 0, 0);
    const child = makeNode("child", 0, 0, "containerNode", "g");
    const result = applyInitialGridLayout([group, child], 2, 2);
    expect(result.find((n) => n.id === "child")!.draggable).toBe(true);
  });

  it("sets draggable=true on top-level leaf nodes", () => {
    const nodes = [makeNode("leaf", 0, 0)];
    const result = applyInitialGridLayout(nodes, 1, 1);
    expect(result[0].draggable).toBe(true);
  });

  it("removes extent constraint from child nodes", () => {
    const group = makeGroup("g", 0, 0);
    const child = { ...makeNode("child", 0, 0, "containerNode", "g"), extent: "parent" as const };
    const result = applyInitialGridLayout([group, child], 2, 2);
    expect(result.find((n) => n.id === "child")!.extent).toBeUndefined();
  });

  it("places child nodes on the grid and recomputes group bounds", () => {
    const group = makeGroup("g", 0, 0);
    const child = makeNode("child", 0, 0, "containerNode", "g");
    const result = applyInitialGridLayout([group, child], 2, 2);
    const updatedGroup = result.find((n) => n.id === "g")!;
    const updatedChild = result.find((n) => n.id === "child")!;
    // Child should be at cellCenter(0,0) relative to group
    expect(updatedChild.position).toEqual({
      x: GROUP_PADDING,
      y: GROUP_PADDING,
    });
    // Group should wrap the child
    expect(updatedGroup.position.x).toBe(cellCenter(0, 0).x - GROUP_PADDING);
    expect(updatedGroup.position.y).toBe(cellCenter(0, 0).y - GROUP_PADDING);
  });
});

describe("buildOccupancyMap", () => {
  it("maps occupied cells to node ids", () => {
    const nodes = [makeNode("a", cellCenter(0, 0).x, cellCenter(0, 0).y)];
    const map = buildOccupancyMap(nodes, 3, 3);
    expect(map.get("0,0")).toBe("a");
  });

  it("ignores group nodes", () => {
    const pos = cellCenter(0, 0);
    const nodes = [makeGroup("g", pos.x, pos.y)];
    const map = buildOccupancyMap(nodes, 3, 3);
    expect(map.size).toBe(0);
  });

  it("includes child nodes when their position is absolute", () => {
    // buildOccupancyMap expects absolute positions — caller must resolveAbsolutePositions first
    const pos = cellCenter(0, 0);
    const nodes = [makeNode("child", pos.x, pos.y, "containerNode", "parent")];
    const map = buildOccupancyMap(nodes, 3, 3);
    expect(map.get("0,0")).toBe("child");
    expect(map.size).toBe(1);
  });

  it("handles multiple nodes in different cells", () => {
    const nodes = [
      makeNode("a", cellCenter(0, 0).x, cellCenter(0, 0).y),
      makeNode("b", cellCenter(1, 2).x, cellCenter(1, 2).y),
    ];
    const map = buildOccupancyMap(nodes, 3, 3);
    expect(map.get("0,0")).toBe("a");
    expect(map.get("1,2")).toBe("b");
    expect(map.size).toBe(2);
  });
});
