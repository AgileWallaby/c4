import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";
import type { StructurizrView } from "../parser/types";

const views: StructurizrView[] = [
  { key: "landscape", description: "Landscape" },
  { key: "context" },
];

describe("Header", () => {
  it("displays the workspace name", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByText("My Workspace")).toBeTruthy();
  });

  it("renders a ViewSelector with the available views", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("passes selectedViewKey to the ViewSelector", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="context"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("context");
  });

  it("calls onViewChange when the view selection changes", async () => {
    const onViewChange = vi.fn();
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={onViewChange}
        onReset={vi.fn()}
      />,
    );
    await userEvent.selectOptions(screen.getByRole("combobox"), "context");
    expect(onViewChange).toHaveBeenCalledWith("context");
  });

  it("renders an Upload new button", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /upload new/i })).toBeTruthy();
  });

  it("calls onReset when Upload new is clicked", async () => {
    const onReset = vi.fn();
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={onReset}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /upload new/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
