import { getBezierPath, BaseEdge, type EdgeProps, type Edge } from '@xyflow/react'

type RelationshipEdgeType = Edge<{ description?: string; technology?: string }, 'relationshipEdge'>

/**
 * SSR-compatible relationship edge. Uses SVG foreignObject instead of
 * EdgeLabelRenderer (which relies on React portals that don't work
 * with renderToStaticMarkup).
 */
export function SsrRelationshipEdge({
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
    })

    const hasLabel = data?.description || data?.technology

    // Estimate label dimensions for centering the foreignObject
    const labelWidth = 160
    const labelHeight = data?.description && data?.technology ? 40 : 24

    return (
        <>
            <defs>
                <marker id={`arrow-${id}`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#b1b1b7" />
                </marker>
            </defs>
            <BaseEdge id={id} path={edgePath} markerEnd={`url(#arrow-${id})`} />
            {hasLabel && (
                <foreignObject
                    x={labelX - labelWidth / 2}
                    y={labelY - labelHeight / 2}
                    width={labelWidth}
                    height={labelHeight}
                    requiredExtensions="http://www.w3.org/1999/xhtml"
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            textAlign: 'center',
                            fontSize: '12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            boxSizing: 'border-box',
                        }}
                    >
                        {data?.description && (
                            <div style={{ fontWeight: 500, color: '#1f2937' }}>{data.description}</div>
                        )}
                        {data?.technology && (
                            <div style={{ fontStyle: 'italic', color: '#6b7280' }}>[{data.technology}]</div>
                        )}
                    </div>
                </foreignObject>
            )}
        </>
    )
}
