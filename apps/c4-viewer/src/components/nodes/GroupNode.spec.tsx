import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { GroupNode } from "./GroupNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

function makeProps(
  overrides: Partial<{ label: string; style?: CSSProperties }> = {},
) {
  return {
    id: "group-1",
    data: {
      label: "Internal Users",
      ...overrides,
    },
    type: "groupNode" as const,
    selected: false,
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    style: overrides.style,
  };
}

describe("GroupNode", () => {
  it("renders the group label", () => {
    render(<GroupNode {...makeProps({ label: "Internal Users" })} />);
    expect(screen.getByText("Internal Users")).toBeTruthy();
  });

  it("applies dashed border styling", () => {
    const { container } = render(<GroupNode {...makeProps()} />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("border-dashed");
  });

  it("applies transparent background", () => {
    const { container } = render(<GroupNode {...makeProps()} />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-transparent");
  });

  it("applies dynamic width/height from style prop", () => {
    const { container } = render(
      <GroupNode {...makeProps({ style: { width: 300, height: 200 } })} />,
    );
    const div = container.querySelector("div")!;
    expect(div.style.width).toBe("300px");
    expect(div.style.height).toBe("200px");
  });
});
