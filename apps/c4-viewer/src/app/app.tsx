import { useState } from "react";
import type { WorkspaceJson } from "../parser/types";
import { getAllViews, parseView } from "../parser/workspaceJsonParser";
import { WorkspaceLoader } from "../components/WorkspaceLoader";
import { Header } from "../components/Header";
import { DiagramCanvas } from "../components/DiagramCanvas";

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceJson | null>(null);
  const [selectedViewKey, setSelectedViewKey] = useState<string>("");

  function handleWorkspaceLoaded(ws: WorkspaceJson) {
    const allViews = getAllViews(ws);
    setWorkspace(ws);
    setSelectedViewKey(allViews[0]?.key ?? "");
  }

  function handleReset() {
    setWorkspace(null);
    setSelectedViewKey("");
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
        onViewChange={setSelectedViewKey}
        onReset={handleReset}
      />
      <div className="flex-1 overflow-hidden">
        <DiagramCanvas nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}

export default App;
