import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";

type RelationshipEdgeType = Edge<
  { description?: string; technology?: string },
  "relationshipEdge"
>;

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<RelationshipEdgeType>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const hasLabel = data?.description || data?.technology;

  return (
    <>
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#b1b1b7" />
        </marker>
      </defs>
      <BaseEdge id={id} path={edgePath} markerEnd={`url(#arrow-${id})`} />
      {hasLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan rounded bg-white px-1.5 py-0.5 text-center text-xs shadow-sm"
          >
            {data?.description && (
              <div className="font-medium text-gray-800">
                {data.description}
              </div>
            )}
            {data?.technology && (
              <div className="italic text-gray-500">[{data.technology}]</div>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
