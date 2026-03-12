import { useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  useNodesState,
} from "@xyflow/react";
import type { Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PersonNode } from "./nodes/PersonNode";
import { SoftwareSystemNode } from "./nodes/SoftwareSystemNode";
import { ContainerNode } from "./nodes/ContainerNode";
import { GroupNode } from "./nodes/GroupNode";
import { RelationshipEdge } from "./nodes/RelationshipEdge";

const nodeTypes = {
  personNode: PersonNode,
  softwareSystemNode: SoftwareSystemNode,
  containerNode: ContainerNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

interface DiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
}

export function DiagramCanvas({
  nodes: initialNodes,
  edges,
}: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        nodesConnectable={false}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
