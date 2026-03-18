import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkspaceLoader } from "./WorkspaceLoader";
import type { WorkspaceJson } from '@c4/c4-parser'

const minimalWorkspace: WorkspaceJson = {
  name: "Test",
  model: {},
  views: {},
};

function makeJsonFile(content: string, name = "workspace.json"): File {
  return new File([content], name, { type: "application/json" });
}

describe("WorkspaceLoader", () => {
  it("renders drop zone with instructional text", () => {
    render(<WorkspaceLoader onWorkspaceLoaded={vi.fn()} />);
    expect(
      screen.getByText(/Drop your Structurizr workspace JSON here/i),
    ).toBeTruthy();
    expect(screen.getByText(/click to browse/i)).toBeTruthy();
  });

  it("renders a hidden file input accepting .json", () => {
    render(<WorkspaceLoader onWorkspaceLoaded={vi.fn()} />);
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    expect(input.type).toBe("file");
    expect(input.accept).toBe(".json");
  });

  it("calls onWorkspaceLoaded with parsed JSON when a valid file is dropped", async () => {
    const onLoad = vi.fn();
    render(<WorkspaceLoader onWorkspaceLoaded={onLoad} />);

    const dropZone = screen
      .getByText(/Drop your Structurizr workspace JSON here/i)
      .closest("div")!;
    const file = makeJsonFile(JSON.stringify(minimalWorkspace));

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => expect(onLoad).toHaveBeenCalledOnce());
    expect(onLoad).toHaveBeenCalledWith(minimalWorkspace);
  });

  it("shows an error message when the dropped file is not valid JSON", async () => {
    render(<WorkspaceLoader onWorkspaceLoaded={vi.fn()} />);

    const dropZone = screen
      .getByText(/Drop your Structurizr workspace JSON here/i)
      .closest("div")!;
    const file = makeJsonFile("not valid json", "bad.json");

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent).toContain("bad.json");
  });

  it("calls onWorkspaceLoaded when a valid file is selected via the file picker", async () => {
    const onLoad = vi.fn();
    render(<WorkspaceLoader onWorkspaceLoaded={onLoad} />);

    const input = screen.getByTestId("file-input");
    const file = makeJsonFile(JSON.stringify(minimalWorkspace));

    await userEvent.upload(input, file);

    await waitFor(() => expect(onLoad).toHaveBeenCalledOnce());
    expect(onLoad).toHaveBeenCalledWith(minimalWorkspace);
  });

  it("shows an error message when the file picker file is invalid JSON", async () => {
    render(<WorkspaceLoader onWorkspaceLoaded={vi.fn()} />);

    const input = screen.getByTestId("file-input");
    const file = makeJsonFile("{bad json}", "broken.json");

    await userEvent.upload(input, file);

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent).toContain("broken.json");
  });

  it("clears an existing error when a valid file is subsequently dropped", async () => {
    const onLoad = vi.fn();
    render(<WorkspaceLoader onWorkspaceLoaded={onLoad} />);

    const dropZone = screen
      .getByText(/Drop your Structurizr workspace JSON here/i)
      .closest("div")!;

    // First drop an invalid file to trigger an error
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [makeJsonFile("bad", "bad.json")] },
    });
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());

    // Then drop a valid file — error should clear
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [makeJsonFile(JSON.stringify(minimalWorkspace))] },
    });
    await waitFor(() => expect(onLoad).toHaveBeenCalledOnce());
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("applies drag-over styling when dragging over the drop zone", () => {
    render(<WorkspaceLoader onWorkspaceLoaded={vi.fn()} />);

    const dropZone = screen
      .getByText(/Drop your Structurizr workspace JSON here/i)
      .closest("div")!;

    fireEvent.dragOver(dropZone);
    expect(dropZone.className).toContain("border-blue-500");

    fireEvent.dragLeave(dropZone);
    expect(dropZone.className).toContain("border-gray-300");
  });
});
