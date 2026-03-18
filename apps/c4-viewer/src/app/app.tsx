import { useState, useCallback } from "react";
import type { WorkspaceJson } from "../parser/types";
import { getAllViews, parseView } from "@c4/c4-parser";
import { WorkspaceLoader } from "../components/WorkspaceLoader";
import { Header } from "../components/Header";
import { DiagramCanvas } from "../components/DiagramCanvas";
import { isGridNode, computeDefaultGridDimensions } from "../utils/gridLayout";

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceJson | null>(null);
  const [selectedViewKey, setSelectedViewKey] = useState<string>("");
  const [gridRows, setGridRows] = useState(1);
  const [gridCols, setGridCols] = useState(1);

  function resetGridForView(ws: WorkspaceJson, viewKey: string) {
    const { nodes } = parseView(ws, viewKey);
    const leafCount = nodes.filter(isGridNode).length;
    const { rows, cols } = computeDefaultGridDimensions(leafCount);
    setGridRows(rows);
    setGridCols(cols);
  }

  function handleWorkspaceLoaded(ws: WorkspaceJson) {
    const allViews = getAllViews(ws);
    const firstKey = allViews[0]?.key ?? "";
    setWorkspace(ws);
    setSelectedViewKey(firstKey);
    if (firstKey) resetGridForView(ws, firstKey);
  }

  function handleReset() {
    setWorkspace(null);
    setSelectedViewKey("");
  }

  function handleViewChange(key: string) {
    setSelectedViewKey(key);
    resetGridForView(workspace!, key);
  }

  const handleExportImage = useCallback(async () => {
    if (!workspace || !selectedViewKey) return;

    const res = await fetch("/api/export-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspace, viewKey: selectedViewKey }),
    });

    if (!res.ok) {
      console.error("Export failed:", await res.text());
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${selectedViewKey}.png`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [workspace, selectedViewKey]);

  if (!workspace) {
    return <WorkspaceLoader onWorkspaceLoaded={handleWorkspaceLoaded} />;
  }

  const views = getAllViews(workspace);
  const { nodes, edges } = parseView(workspace, selectedViewKey);

  return (
    <div className="flex h-screen flex-col">
      <Header
        workspaceName={workspace.name ?? "Unnamed workspace"}
        views={views}
        selectedViewKey={selectedViewKey}
        onViewChange={handleViewChange}
        onReset={handleReset}
        onExportImage={handleExportImage}
        gridRows={gridRows}
        gridCols={gridCols}
        minCells={nodes.filter(isGridNode).length}
        onGridRowsChange={setGridRows}
        onGridColsChange={setGridCols}
      />
      <div className="flex-1 overflow-hidden">
        <DiagramCanvas
          nodes={nodes}
          edges={edges}
          gridRows={gridRows}
          gridCols={gridCols}
        />
      </div>
    </div>
  );
}

export default App;
