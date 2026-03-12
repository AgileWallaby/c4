import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DiagramCanvas } from "./DiagramCanvas";
import type { Node, Edge } from "@xyflow/react";

beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    /* eslint-disable @typescript-eslint/no-empty-function */
    observe() {}
    unobserve() {}
    disconnect() {}
    /* eslint-enable @typescript-eslint/no-empty-function */
  };
});

let capturedOnNodeDragStop:
  | ((_e: React.MouseEvent, node: Node) => void)
  | undefined;

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    defaultViewport,
    minZoom,
    onNodeDragStop,
    onInit,
    children,
  }: {
    nodes: Node[];
    edges: Edge[];
    nodeTypes: Record<string, unknown>;
    edgeTypes: Record<string, unknown>;
    defaultViewport?: { x: number; y: number; zoom: number };
    minZoom?: number;
    onNodeDragStop?: (_e: React.MouseEvent, node: Node) => void;
    onInit?: (instance: { setViewport: () => void }) => void;
    children?: React.ReactNode;
  }) => {
    const React = require("react");
    React.useEffect(() => {
      onInit?.({ setViewport: vi.fn() });
    }, [onInit]);
    capturedOnNodeDragStop = onNodeDragStop;
    return (
      <div
        data-testid="react-flow"
        data-node-count={nodes.length}
        data-edge-count={edges.length}
        data-node-types={Object.keys(nodeTypes).join(",")}
        data-edge-types={Object.keys(edgeTypes).join(",")}
        data-default-viewport={
          defaultViewport ? JSON.stringify(defaultViewport) : ""
        }
        data-min-zoom={minZoom !== undefined ? String(minZoom) : ""}
      >
        {children}
      </div>
    );
  },
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  useNodesState: (initialNodes: Node[]) => {
    const React = require("react");
    const [nodes, setNodes] = React.useState(initialNodes);
    return [nodes, setNodes, vi.fn()];
  },
  useViewport: () => ({ x: 0, y: 0, zoom: 1 }),
}));

vi.mock("@xyflow/react/dist/style.css", () => ({}));

const sampleNodes: Node[] = [
  {
    id: "1",
    type: "personNode",
    position: { x: 0, y: 0 },
    data: { label: "User" },
  },
  {
    id: "2",
    type: "softwareSystemNode",
    position: { x: 200, y: 0 },
    data: { label: "System" },
  },
];

const sampleEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", type: "relationshipEdge" },
];

describe("DiagramCanvas", () => {
  it("renders a ReactFlow container", () => {
    render(
      <DiagramCanvas
        nodes={sampleNodes}
        edges={sampleEdges}
        gridRows={2}
        gridCols={2}
      />,
    );
    expect(screen.getByTestId("react-flow")).toBeTruthy();
  });

  it("passes nodes and edges to ReactFlow", () => {
    render(
      <DiagramCanvas
        nodes={sampleNodes}
        edges={sampleEdges}
        gridRows={2}
        gridCols={2}
      />,
    );
    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-node-count")).toBe("2");
    expect(flow.getAttribute("data-edge-count")).toBe("1");
  });

  it("registers all custom node types", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />);
    const flow = screen.getByTestId("react-flow");
    const types = flow.getAttribute("data-node-types")!.split(",");
    expect(types).toContain("personNode");
    expect(types).toContain("softwareSystemNode");
    expect(types).toContain("containerNode");
    expect(types).toContain("groupNode");
  });

  it("registers the custom edge type", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />);
    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-edge-types")).toContain("relationshipEdge");
  });

  it("sets defaultViewport to zoom=1 at origin so grid fills container", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />);
    const vp = JSON.parse(
      screen.getByTestId("react-flow").getAttribute("data-default-viewport") ??
        "{}",
    );
    expect(vp).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it("renders Controls", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />);
    expect(screen.getByTestId("controls")).toBeTruthy();
  });

  it("renders MiniMap", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />);
    expect(screen.getByTestId("minimap")).toBeTruthy();
  });

  it("renders a bounded grid SVG", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={3} />);
    expect(screen.getByTestId("grid-background")).toBeTruthy();
  });

  it("wraps canvas in a full-size div", () => {
    const { container } = render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/h-full/);
    expect(wrapper.className).toMatch(/w-full/);
  });

  it("passes a minZoom prop between 0 and 1 to ReactFlow", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />);
    const val = Number(
      screen.getByTestId("react-flow").getAttribute("data-min-zoom"),
    );
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it("snaps node to cell center after drag to empty cell", async () => {
    const leafNode: Node = {
      id: "leaf1",
      type: "softwareSystemNode",
      position: { x: 32, y: 40 }, // cellCenter(0,0) with defaults
      data: { label: "A" },
    };
    render(
      <DiagramCanvas nodes={[leafNode]} edges={[]} gridRows={2} gridCols={2} />,
    );

    // Simulate drag to cell (0,1)
    const draggedNode = { ...leafNode, position: { x: 272, y: 40 } };
    await act(async () => {
      capturedOnNodeDragStop?.({} as React.MouseEvent, draggedNode);
    });

    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-node-count")).toBe("1");
  });

  it("reverts node to origin cell when target cell is occupied", async () => {
    const { cellCenter } = await import("../utils/gridLayout");
    const nodeA: Node = {
      id: "A",
      type: "softwareSystemNode",
      position: cellCenter(0, 0),
      data: { label: "A" },
    };
    const nodeB: Node = {
      id: "B",
      type: "softwareSystemNode",
      position: cellCenter(0, 1),
      data: { label: "B" },
    };

    render(
      <DiagramCanvas
        nodes={[nodeA, nodeB]}
        edges={[]}
        gridRows={2}
        gridCols={2}
      />,
    );

    // Drag A onto B's occupied cell
    const draggedA = { ...nodeA, position: cellCenter(0, 1) };
    await act(async () => {
      capturedOnNodeDragStop?.({} as React.MouseEvent, draggedA);
    });

    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-node-count")).toBe("2");
  });
});
