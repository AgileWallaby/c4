import { useLayoutEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useViewport,
} from "@xyflow/react";
import type { Node, Edge, ReactFlowInstance } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PersonNode } from "./nodes/PersonNode";
import { SoftwareSystemNode } from "./nodes/SoftwareSystemNode";
import { ContainerNode } from "./nodes/ContainerNode";
import { GroupNode } from "./nodes/GroupNode";
import { RelationshipEdge } from "./nodes/RelationshipEdge";
import {
  isGridNode,
  positionToCell,
  buildOccupancyMap,
  cellCenter,
  applyInitialGridLayout,
  resolveAbsolutePositions,
  recomputeGroupSizes,
  computeMinZoom,
  rescaleToNewCellSizes,
  CELL_WIDTH,
  CELL_HEIGHT,
} from "../utils/gridLayout";

const nodeTypes = {
  personNode: PersonNode,
  softwareSystemNode: SoftwareSystemNode,
  containerNode: ContainerNode,
  groupNode: GroupNode,
};

const edgeTypes = {
  relationshipEdge: RelationshipEdge,
};

// Rendered as a child of ReactFlow — useViewport() has access to the flow context.
function GridBackground({
  rows,
  cols,
  cellWidth,
  cellHeight,
}: {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
}) {
  const { x, y, zoom } = useViewport();
  const cw = cellWidth * zoom;
  const ch = cellHeight * zoom;
  const totalW = cols * cw;
  const totalH = rows * ch;

  return (
    <svg
      data-testid="grid-background"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <g transform={`translate(${x},${y})`}>
        <rect
          x={0}
          y={0}
          width={totalW}
          height={totalH}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        {Array.from({ length: cols - 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={(i + 1) * cw}
            y1={0}
            x2={(i + 1) * cw}
            y2={totalH}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
        {Array.from({ length: rows - 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={(i + 1) * ch}
            x2={totalW}
            y2={(i + 1) * ch}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}
      </g>
    </svg>
  );
}

interface DiagramCanvasProps {
  nodes: Node[];
  edges: Edge[];
  gridRows: number;
  gridCols: number;
}

export function DiagramCanvas({
  nodes: rawNodes,
  edges,
  gridRows,
  gridCols,
}: DiagramCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState({
    cellWidth: CELL_WIDTH,
    cellHeight: CELL_HEIGHT,
  });
  const [minZoom, setMinZoom] = useState(0.5);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const cellSizeRef = useRef({ cellWidth: CELL_WIDTH, cellHeight: CELL_HEIGHT });
  const gridDimsRef = useRef({ gridRows, gridCols });
  gridDimsRef.current = { gridRows, gridCols };
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const dragOriginRef = useRef<Map<string, { row: number; col: number }>>(
    new Map(),
  );

  useLayoutEffect(() => {
    const el = containerRef.current;
    const w =
      el && el.clientWidth > 0 ? el.clientWidth : gridCols * CELL_WIDTH;
    const h =
      el && el.clientHeight > 0 ? el.clientHeight : gridRows * CELL_HEIGHT;
    const cellWidth = w / gridCols;
    const cellHeight = h / gridRows;
    const newCellSize = { cellWidth, cellHeight };
    cellSizeRef.current = newCellSize;
    setCellSize(newCellSize);
    setMinZoom(computeMinZoom(w, h));
    setNodes(
      applyInitialGridLayout(rawNodes, gridRows, gridCols, cellWidth, cellHeight),
    );
    // Reset viewport so the grid fills the container edge-to-edge (zoom=1 with
    // cellWidth = containerW/cols means the grid exactly fills the viewport).
    rfInstanceRef.current?.setViewport({ x: 0, y: 0, zoom: 1 });
  }, [rawNodes, gridRows, gridCols]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w <= 0 || h <= 0) return;
      const { gridRows: rows, gridCols: cols } = gridDimsRef.current;
      const newCellWidth = w / cols;
      const newCellHeight = h / rows;
      const { cellWidth: oldCellWidth, cellHeight: oldCellHeight } = cellSizeRef.current;
      // Skip sub-pixel noise to avoid infinite reflow loops.
      if (
        Math.abs(newCellWidth - oldCellWidth) < 0.5 &&
        Math.abs(newCellHeight - oldCellHeight) < 0.5
      ) return;
      const newCellSize = { cellWidth: newCellWidth, cellHeight: newCellHeight };
      cellSizeRef.current = newCellSize; // update ref BEFORE setNodes
      setCellSize(newCellSize);
      setMinZoom(computeMinZoom(w, h));
      setNodes((currentNodes) =>
        rescaleToNewCellSizes(
          currentNodes,
          rows,
          cols,
          oldCellWidth,
          oldCellHeight,
          newCellWidth,
          newCellHeight,
        ),
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Absolute canvas position of a node (handles child nodes with a parentId). */
  function absolutePosition(
    node: Node,
  ): { x: number; y: number } {
    if (!node.parentId) return node.position;
    const parent = nodes.find((n) => n.id === node.parentId);
    return {
      x: (parent?.position.x ?? 0) + node.position.x,
      y: (parent?.position.y ?? 0) + node.position.y,
    };
  }

  function handleNodeDragStart(_e: React.MouseEvent, node: Node) {
    if (!isGridNode(node)) return;
    const { cellWidth, cellHeight } = cellSize;
    const abs = absolutePosition(node);
    const cell = positionToCell(
      abs.x,
      abs.y,
      gridRows,
      gridCols,
      cellWidth,
      cellHeight,
    );
    if (cell) dragOriginRef.current.set(node.id, cell);
  }

  function handleNodeDragStop(_e: React.MouseEvent, node: Node) {
    if (!isGridNode(node)) return;
    const { cellWidth, cellHeight } = cellSize;

    // Absolute position of the dragged node at drop time.
    const abs = absolutePosition(node);
    const targetCell = positionToCell(
      abs.x,
      abs.y,
      gridRows,
      gridCols,
      cellWidth,
      cellHeight,
    );
    const origin = dragOriginRef.current.get(node.id);
    dragOriginRef.current.delete(node.id);

    // Build occupancy from all OTHER grid nodes using absolute positions.
    const absNodes = resolveAbsolutePositions(nodes);
    const others = absNodes.filter((n) => n.id !== node.id && isGridNode(n));
    const occupied = buildOccupancyMap(others, gridRows, gridCols, cellWidth, cellHeight);

    const snapCell =
      targetCell === null || occupied.has(`${targetCell.row},${targetCell.col}`)
        ? (origin ?? { row: 0, col: 0 })
        : targetCell;

    const snapAbs = cellCenter(snapCell.row, snapCell.col, cellWidth, cellHeight);

    // Compute new position: relative to parent if the node has one.
    const parent = node.parentId
      ? nodes.find((n) => n.id === node.parentId)
      : null;
    const newPos = parent
      ? { x: snapAbs.x - parent.position.x, y: snapAbs.y - parent.position.y }
      : snapAbs;

    // Apply snap then recompute group bounds.
    const snapped = nodes.map((n) =>
      n.id === node.id ? { ...n, position: newPos } : n,
    );
    setNodes(recomputeGroupSizes(snapped, cellWidth, cellHeight));
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        nodesConnectable={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        onInit={(inst) => { rfInstanceRef.current = inst; }}
        minZoom={minZoom}
      >
        <GridBackground
          rows={gridRows}
          cols={gridCols}
          cellWidth={cellSize.cellWidth}
          cellHeight={cellSize.cellHeight}
        />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
