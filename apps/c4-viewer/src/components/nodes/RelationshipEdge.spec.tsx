import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelationshipEdge } from "./RelationshipEdge";
import { Position } from "@xyflow/react";

vi.mock("@xyflow/react", async () => {
  const actual = await vi.importActual<typeof import("@xyflow/react")>(
    "@xyflow/react",
  );
  return {
    ...actual,
    getBezierPath: () => ["M0 0", 50, 50],
    BaseEdge: ({ id }: { id: string }) => <path data-testid={`edge-${id}`} />,
    EdgeLabelRenderer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="edge-label-renderer">{children}</div>
    ),
    Position: actual.Position,
  };
});

function makeProps(
  data: { description?: string; technology?: string } = {},
): Parameters<typeof RelationshipEdge>[0] {
  return {
    id: "edge-1",
    sourceX: 0,
    sourceY: 0,
    targetX: 100,
    targetY: 100,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    source: "node-1",
    target: "node-2",
    data,
    selected: false,
    animated: false,
    markerStart: undefined,
    markerEnd: undefined,
    style: undefined,
    interactionWidth: 20,
  };
}

describe("RelationshipEdge", () => {
  it("renders the edge path", () => {
    render(<RelationshipEdge {...makeProps()} />);
    expect(document.querySelector('[data-testid="edge-edge-1"]')).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(<RelationshipEdge {...makeProps({ description: "sends data to" })} />);
    expect(screen.getByText("sends data to")).toBeTruthy();
  });

  it("renders technology in brackets when provided", () => {
    render(<RelationshipEdge {...makeProps({ technology: "HTTPS" })} />);
    expect(screen.getByText("[HTTPS]")).toBeTruthy();
  });

  it("renders both description and technology together", () => {
    render(
      <RelationshipEdge
        {...makeProps({ description: "sends data to", technology: "HTTPS" })}
      />,
    );
    expect(screen.getByText("sends data to")).toBeTruthy();
    expect(screen.getByText("[HTTPS]")).toBeTruthy();
  });

  it("does not render label when neither description nor technology present", () => {
    render(<RelationshipEdge {...makeProps()} />);
    expect(screen.queryByTestId("edge-label-renderer")).toBeNull();
  });

  it("does not render label when data is undefined", () => {
    const props = makeProps();
    // @ts-expect-error testing undefined data
    props.data = undefined;
    render(<RelationshipEdge {...props} />);
    expect(screen.queryByTestId("edge-label-renderer")).toBeNull();
  });
});
