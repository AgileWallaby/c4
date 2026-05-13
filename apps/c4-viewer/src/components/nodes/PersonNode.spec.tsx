import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonNode } from "./PersonNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

function makeProps(
  overrides: Partial<{
    label: string;
    description?: string;
    isExternal: boolean;
  }> = {},
) {
  return {
    id: "node-1",
    data: {
      label: "Alice",
      elementType: "Person",
      isExternal: false,
      ...overrides,
    },
    type: "personNode" as const,
    selected: false,
    dragging: false,
    draggable: true,
    selectable: true,
    deletable: true,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  };
}

describe("PersonNode", () => {
  it("renders the label", () => {
    render(<PersonNode {...makeProps({ label: "Alice" })} />);
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("renders [Person] type label", () => {
    render(<PersonNode {...makeProps()} />);
    expect(screen.getByText("[Person]")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(<PersonNode {...makeProps({ description: "A user" })} />);
    expect(screen.getByText("A user")).toBeTruthy();
  });

  it("does not render description when absent", () => {
    render(<PersonNode {...makeProps()} />);
    expect(screen.queryByText("A user")).toBeNull();
  });

  it("uses blue background for internal person", () => {
    const { container } = render(
      <PersonNode {...makeProps({ isExternal: false })} />,
    );
    expect(container.firstChild?.toString()).toBeTruthy();
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-blue-600");
  });

  it("uses grey background for external person", () => {
    const { container } = render(
      <PersonNode {...makeProps({ isExternal: true })} />,
    );
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-gray-500");
  });
});
