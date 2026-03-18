import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";
import type { StructurizrView } from "@c4/c4-parser";

const views: StructurizrView[] = [
  { key: "landscape", description: "Landscape" },
  { key: "context" },
];

const defaultGridProps = {
  gridRows: 2,
  gridCols: 2,
  minCells: 4,
  onGridRowsChange: vi.fn(),
  onGridColsChange: vi.fn(),
  onExportImage: vi.fn(),
};

describe("Header", () => {
  it("displays the workspace name", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
        {...defaultGridProps}
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
        {...defaultGridProps}
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
        {...defaultGridProps}
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
        {...defaultGridProps}
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
        {...defaultGridProps}
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
        {...defaultGridProps}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /upload new/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("renders rows and cols inputs with correct values", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
        onExportImage={vi.fn()}
        gridRows={3}
        gridCols={4}
        minCells={6}
        onGridRowsChange={vi.fn()}
        onGridColsChange={vi.fn()}
      />,
    );
    expect((screen.getByLabelText("Rows") as HTMLInputElement).value).toBe("3");
    expect((screen.getByLabelText("Cols") as HTMLInputElement).value).toBe("4");
  });

  it("calls onGridRowsChange when rows input changes", async () => {
    const onGridRowsChange = vi.fn();
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
        onExportImage={vi.fn()}
        gridRows={2}
        gridCols={2}
        minCells={4}
        onGridRowsChange={onGridRowsChange}
        onGridColsChange={vi.fn()}
      />,
    );
    await userEvent.clear(screen.getByLabelText("Rows"));
    await userEvent.type(screen.getByLabelText("Rows"), "3");
    expect(onGridRowsChange).toHaveBeenCalled();
  });

  it("renders an Export PNG button", () => {
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
        {...defaultGridProps}
      />,
    );
    expect(screen.getByRole("button", { name: /export png/i })).toBeTruthy();
  });

  it("calls onExportImage when Export PNG is clicked", async () => {
    const onExportImage = vi.fn();
    render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
        {...defaultGridProps}
        onExportImage={onExportImage}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /export png/i }));
    expect(onExportImage).toHaveBeenCalledOnce();
  });

  it("auto-adjusts cols upwards when rows reduced below minimum", () => {
    const onGridRowsChange = vi.fn();
    const onGridColsChange = vi.fn();
    const { getByLabelText } = render(
      <Header
        workspaceName="My Workspace"
        views={views}
        selectedViewKey="landscape"
        onViewChange={vi.fn()}
        onReset={vi.fn()}
        onExportImage={vi.fn()}
        gridRows={2}
        gridCols={2}
        minCells={4}
        onGridRowsChange={onGridRowsChange}
        onGridColsChange={onGridColsChange}
      />,
    );
    // Setting rows to 1 with minCells=4 requires cols >= 4
    fireEvent.change(getByLabelText("Rows"), { target: { value: "1" } });
    expect(onGridColsChange).toHaveBeenCalledWith(4);
  });
});
