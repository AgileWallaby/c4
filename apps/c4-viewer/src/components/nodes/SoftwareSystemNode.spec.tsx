import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SoftwareSystemNode } from "./SoftwareSystemNode";

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
      label: "Internet Banking",
      elementType: "SoftwareSystem",
      isExternal: false,
      ...overrides,
    },
    type: "softwareSystemNode" as const,
    selected: false,
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  };
}

describe("SoftwareSystemNode", () => {
  it("renders the label", () => {
    render(
      <SoftwareSystemNode {...makeProps({ label: "Internet Banking" })} />,
    );
    expect(screen.getByText("Internet Banking")).toBeTruthy();
  });

  it("renders [Software System] type label", () => {
    render(<SoftwareSystemNode {...makeProps()} />);
    expect(screen.getByText("[Software System]")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <SoftwareSystemNode {...makeProps({ description: "Online banking" })} />,
    );
    expect(screen.getByText("Online banking")).toBeTruthy();
  });

  it("does not render description when absent", () => {
    render(<SoftwareSystemNode {...makeProps()} />);
    expect(screen.queryByText("Online banking")).toBeNull();
  });

  it("uses blue background for internal system", () => {
    const { container } = render(
      <SoftwareSystemNode {...makeProps({ isExternal: false })} />,
    );
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-blue-600");
  });

  it("uses grey background for external system", () => {
    const { container } = render(
      <SoftwareSystemNode {...makeProps({ isExternal: true })} />,
    );
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-gray-500");
  });
});
