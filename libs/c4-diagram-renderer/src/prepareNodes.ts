import type { Node } from '@xyflow/react'
import { Position } from '@xyflow/react'
import { NODE_WIDTH, NODE_HEIGHT } from '@c4/c4-parser'

/**
 * Augments nodes with explicit width, height, and handle positions
 * required for React Flow SSR (server-side rendering).
 *
 * In a browser, React Flow measures DOM elements to get node dimensions
 * and handle positions. On the server, we must provide these explicitly.
 */
export function prepareNodesForSsr(nodes: Node[]): Node[] {
    return nodes.map((node) => {
        if (node.type === 'groupNode') {
            // Group nodes use style-based dimensions; provide handles at edges
            const w = (node.style?.width as number) ?? 200
            const h = (node.style?.height as number) ?? 200
            return {
                ...node,
                width: w,
                height: h,
                handles: [
                    { type: 'target' as const, position: Position.Top, x: w / 2, y: 0, id: 'top' },
                    { type: 'source' as const, position: Position.Bottom, x: w / 2, y: h, id: 'bottom' },
                    { type: 'target' as const, position: Position.Left, x: 0, y: h / 2, id: 'left' },
                    { type: 'source' as const, position: Position.Right, x: w, y: h / 2, id: 'right' },
                ],
            }
        }

        // Element nodes (person, softwareSystem, container) all use NODE_WIDTH x NODE_HEIGHT
        return {
            ...node,
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            handles: [
                { type: 'target' as const, position: Position.Top, x: NODE_WIDTH / 2, y: 0, id: 'top' },
                { type: 'source' as const, position: Position.Bottom, x: NODE_WIDTH / 2, y: NODE_HEIGHT, id: 'bottom' },
                { type: 'target' as const, position: Position.Left, x: 0, y: NODE_HEIGHT / 2, id: 'left' },
                { type: 'source' as const, position: Position.Right, x: NODE_WIDTH, y: NODE_HEIGHT / 2, id: 'right' },
            ],
        }
    })
}
