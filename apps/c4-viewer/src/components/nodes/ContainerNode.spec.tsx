import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContainerNode } from "./ContainerNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

function makeProps(
  overrides: Partial<{
    label: string;
    description?: string;
    technology?: string;
    isExternal: boolean;
  }> = {},
) {
  return {
    id: "node-1",
    data: {
      label: "API Application",
      elementType: "Container",
      isExternal: false,
      ...overrides,
    },
    type: "containerNode" as const,
    selected: false,
    dragging: false,
    zIndex: 0,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  };
}

describe("ContainerNode", () => {
  it("renders the label", () => {
    render(<ContainerNode {...makeProps({ label: "API Application" })} />);
    expect(screen.getByText("API Application")).toBeTruthy();
  });

  it("renders [Container] when no technology provided", () => {
    render(<ContainerNode {...makeProps()} />);
    expect(screen.getByText("[Container]")).toBeTruthy();
  });

  it("renders [Container: technology] when technology is provided", () => {
    render(<ContainerNode {...makeProps({ technology: "Java" })} />);
    expect(screen.getByText("[Container: Java]")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(
      <ContainerNode {...makeProps({ description: "Handles API requests" })} />,
    );
    expect(screen.getByText("Handles API requests")).toBeTruthy();
  });

  it("does not render description when absent", () => {
    render(<ContainerNode {...makeProps()} />);
    expect(screen.queryByText("Handles API requests")).toBeNull();
  });

  it("uses blue background for internal container", () => {
    const { container } = render(
      <ContainerNode {...makeProps({ isExternal: false })} />,
    );
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-blue-600");
  });

  it("uses grey background for external container", () => {
    const { container } = render(
      <ContainerNode {...makeProps({ isExternal: true })} />,
    );
    const div = container.querySelector("div")!;
    expect(div.className).toContain("bg-gray-500");
  });
});
