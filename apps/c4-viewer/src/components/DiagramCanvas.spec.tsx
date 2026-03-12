import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiagramCanvas } from "./DiagramCanvas";
import type { Node, Edge } from "@xyflow/react";

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    fitView,
    children,
  }: {
    nodes: Node[];
    edges: Edge[];
    nodeTypes: Record<string, unknown>;
    edgeTypes: Record<string, unknown>;
    fitView?: boolean;
    children?: React.ReactNode;
  }) => (
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
  ),
  Controls: () => <div data-testid="controls" />,
  Background: ({ variant }: { variant?: string }) => (
    <div data-testid="background" data-variant={variant} />
  ),
  MiniMap: () => <div data-testid="minimap" />,
  BackgroundVariant: { Dots: "dots" },
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
    render(<DiagramCanvas nodes={sampleNodes} edges={sampleEdges} />);
    expect(screen.getByTestId("react-flow")).toBeTruthy();
  });

  it("passes nodes and edges to ReactFlow", () => {
    render(<DiagramCanvas nodes={sampleNodes} edges={sampleEdges} />);
    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-node-count")).toBe("2");
    expect(flow.getAttribute("data-edge-count")).toBe("1");
  });

  it("registers all custom node types", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} />);
    const flow = screen.getByTestId("react-flow");
    const types = flow.getAttribute("data-node-types")!.split(",");
    expect(types).toContain("personNode");
    expect(types).toContain("softwareSystemNode");
    expect(types).toContain("containerNode");
    expect(types).toContain("groupNode");
  });

  it("registers the custom edge type", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} />);
    const flow = screen.getByTestId("react-flow");
    expect(flow.getAttribute("data-edge-types")).toContain("relationshipEdge");
  });

  it("enables fitView", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} />);
    expect(screen.getByTestId("react-flow").getAttribute("data-fit-view")).toBe(
      "true",
    );
  });

  it("renders Controls", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} />);
    expect(screen.getByTestId("controls")).toBeTruthy();
  });

  it("renders Background with dots variant", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} />);
    const bg = screen.getByTestId("background");
    expect(bg.getAttribute("data-variant")).toBe("dots");
  });

  it("renders MiniMap", () => {
    render(<DiagramCanvas nodes={[]} edges={[]} />);
    expect(screen.getByTestId("minimap")).toBeTruthy();
  });

  it("wraps canvas in a full-size div", () => {
    const { container } = render(<DiagramCanvas nodes={[]} edges={[]} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/h-full/);
    expect(wrapper.className).toMatch(/w-full/);
  });
});
