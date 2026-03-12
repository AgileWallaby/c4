import { useState } from "react";
import type { WorkspaceJson } from "../parser/types";
import { getAllViews, parseView } from "../parser/workspaceJsonParser";
import { WorkspaceLoader } from "../components/WorkspaceLoader";
import { Header } from "../components/Header";
import { DiagramCanvas } from "../components/DiagramCanvas";
import {
  isGridNode,
  computeDefaultGridDimensions,
} from "../utils/gridLayout";

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
