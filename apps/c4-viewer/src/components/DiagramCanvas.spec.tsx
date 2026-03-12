import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DiagramCanvas } from "./DiagramCanvas";
import type { Node, Edge } from "@xyflow/react";

let capturedOnNodeDragStop:
  | ((_e: React.MouseEvent, node: Node) => void)
  | undefined;

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    fitView,
    onNodeDragStop,
    children,
  }: {
    nodes: Node[];
    edges: Edge[];
    nodeTypes: Record<string, unknown>;
    edgeTypes: Record<string, unknown>;
    fitView?: boolean;
    onNodeDragStop?: (_e: React.MouseEvent, node: Node) => void;
    children?: React.ReactNode;
  }) => {
    capturedOnNodeDragStop = onNodeDragStop;
    return (
      <div
        data-testid="react-flow"
        data-node-count={nodes.length}
        data-edge-count={edges.length}
        data-node-types={Object.keys(nodeTypes).join(",")}
        data-edge-types={Object.keys(edgeTypes).join(",")}
        data-fit-view={fitView ? "true" : "false"}
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
    render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />,
    );
    const flow = screen.getByTestId("react-flow");
    const types = flow.getAttribute("data-node-types")!.split(",");
    expect(types).toContain("personNode");
    expect(types).toContain("softwareSystemNode");
    expect(types).toContain("containerNode");
    expect(types).toContain("groupNode");
  });

  it("registers the custom edge type", () => {
    render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />,
    );
    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-edge-types")).toContain("relationshipEdge");
  });

  it("enables fitView", () => {
    render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />,
    );
    expect(
      screen.getByTestId("react-flow").getAttribute("data-fit-view"),
    ).toBe("true");
  });

  it("renders Controls", () => {
    render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />,
    );
    expect(screen.getByTestId("controls")).toBeTruthy();
  });

  it("renders MiniMap", () => {
    render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={2} />,
    );
    expect(screen.getByTestId("minimap")).toBeTruthy();
  });

  it("renders a bounded grid SVG", () => {
    render(
      <DiagramCanvas nodes={[]} edges={[]} gridRows={2} gridCols={3} />,
    );
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

  it("snaps node to cell center after drag to empty cell", async () => {
    const leafNode: Node = {
      id: "leaf1",
      type: "softwareSystemNode",
      position: { x: 32, y: 40 }, // cellCenter(0,0) with defaults
      data: { label: "A" },
    };
    render(
      <DiagramCanvas
        nodes={[leafNode]}
        edges={[]}
        gridRows={2}
        gridCols={2}
      />,
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
