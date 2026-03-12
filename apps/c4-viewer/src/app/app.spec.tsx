import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./app";
import type { WorkspaceJson } from "../parser/types";

const mockViews = [
  { key: "view1", description: "View 1" },
  { key: "view2", description: "View 2" },
];

vi.mock("../parser/workspaceJsonParser", () => ({
  getAllViews: vi.fn(() => mockViews),
  parseView: vi.fn(() => ({ nodes: [], edges: [] })),
}));

vi.mock("../components/WorkspaceLoader", () => ({
  WorkspaceLoader: ({
    onWorkspaceLoaded,
  }: {
    onWorkspaceLoaded: (ws: WorkspaceJson) => void;
  }) => (
    <div data-testid="workspace-loader">
      <button
        onClick={() =>
          onWorkspaceLoaded({
            name: "Test Workspace",
            model: {},
            views: {},
          } as WorkspaceJson)
        }
      >
        Load Workspace
      </button>
    </div>
  ),
}));

vi.mock("../components/Header", () => ({
  Header: ({
    workspaceName,
    selectedViewKey,
    onReset,
    onViewChange,
  }: {
    workspaceName: string;
    selectedViewKey: string;
    onViewChange: (key: string) => void;
    onReset: () => void;
  }) => (
    <div
      data-testid="header"
      data-workspace={workspaceName}
      data-view-key={selectedViewKey}
    >
      <button data-testid="reset-btn" onClick={onReset}>
        Upload new
      </button>
      <button
        data-testid="change-view-btn"
        onClick={() => onViewChange("view2")}
      >
        Change View
      </button>
    </div>
  ),
}));

vi.mock("../components/DiagramCanvas", () => ({
  DiagramCanvas: ({ nodes, edges }: { nodes: unknown[]; edges: unknown[] }) => (
    <div
      data-testid="diagram-canvas"
      data-nodes={nodes.length}
      data-edges={edges.length}
    />
  ),
}));

describe("App", () => {
  it("shows WorkspaceLoader initially", () => {
    render(<App />);
    expect(screen.getByTestId("workspace-loader")).toBeTruthy();
  });

  it("does not show Header or DiagramCanvas initially", () => {
    render(<App />);
    expect(screen.queryByTestId("header")).toBeNull();
    expect(screen.queryByTestId("diagram-canvas")).toBeNull();
  });

  it("shows Header and DiagramCanvas after workspace is loaded", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Load Workspace"));
    expect(screen.getByTestId("header")).toBeTruthy();
    expect(screen.getByTestId("diagram-canvas")).toBeTruthy();
  });

  it("hides WorkspaceLoader after workspace is loaded", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Load Workspace"));
    expect(screen.queryByTestId("workspace-loader")).toBeNull();
  });

  it("auto-selects the first view key when workspace loads", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Load Workspace"));
    expect(screen.getByTestId("header").getAttribute("data-view-key")).toBe(
      "view1",
    );
  });

  it("passes workspace name to Header", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Load Workspace"));
    expect(screen.getByTestId("header").getAttribute("data-workspace")).toBe(
      "Test Workspace",
    );
  });

  it("resets to WorkspaceLoader when onReset is called", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Load Workspace"));
    fireEvent.click(screen.getByTestId("reset-btn"));
    expect(screen.getByTestId("workspace-loader")).toBeTruthy();
    expect(screen.queryByTestId("header")).toBeNull();
  });

  it("updates selected view key when onViewChange is called", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Load Workspace"));
    fireEvent.click(screen.getByTestId("change-view-btn"));
    expect(screen.getByTestId("header").getAttribute("data-view-key")).toBe(
      "view2",
    );
  });
});
