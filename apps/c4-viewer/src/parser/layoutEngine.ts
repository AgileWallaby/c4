import dagre from '@dagrejs/dagre'
import type { Node, Edge } from '@xyflow/react'
import type { AutoLayout } from './types'

const NODE_WIDTH = 172
const NODE_HEIGHT = 80
const GROUP_PADDING = 40

const rankDirectionMap: Record<string, string> = {
    TopBottom: 'TB',
    BottomTop: 'BT',
    LeftRight: 'LR',
    RightLeft: 'RL',
}

export function computeLayout(nodes: Node[], edges: Edge[], autoLayout?: AutoLayout): Node[] {
    const rankdir = autoLayout?.rankDirection ? (rankDirectionMap[autoLayout.rankDirection] ?? 'TB') : 'TB'
    const ranksep = autoLayout?.rankSeparation ?? 50
    const nodesep = autoLayout?.nodeSeparation ?? 50

    // Separate group (parent) nodes from leaf nodes
    const leafNodes = nodes.filter((n) => n.type !== 'groupNode')
    const groupNodes = nodes.filter((n) => n.type === 'groupNode')

    // Pass 1: lay out leaf nodes with dagre
    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir, ranksep, nodesep })
    g.setDefaultEdgeLabel(() => ({}))

    for (const node of leafNodes) {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    }

    // Only add edges between nodes that exist in the leaf set
    const leafIds = new Set(leafNodes.map((n) => n.id))
    for (const edge of edges) {
        if (leafIds.has(edge.source) && leafIds.has(edge.target)) {
            g.setEdge(edge.source, edge.target)
        }
    }

    dagre.layout(g)

    // Apply computed positions to leaf nodes
    const positionedLeaves = leafNodes.map((node) => {
        const pos = g.node(node.id)
        return {
            ...node,
            position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
        }
    })

    if (groupNodes.length === 0) {
        return positionedLeaves
    }

    // Pass 2: size group nodes to wrap their children
    const leafById = new Map(positionedLeaves.map((n) => [n.id, n]))

    const positionedGroups = groupNodes.map((groupNode) => {
        const children = positionedLeaves.filter((n) => n.parentId === groupNode.id)

        if (children.length === 0) {
            return { ...groupNode, position: { x: 0, y: 0 }, style: { ...groupNode.style, width: NODE_WIDTH + GROUP_PADDING * 2, height: NODE_HEIGHT + GROUP_PADDING * 2 } }
        }

        const minX = Math.min(...children.map((c) => c.position.x))
        const minY = Math.min(...children.map((c) => c.position.y))
        const maxX = Math.max(...children.map((c) => c.position.x + NODE_WIDTH))
        const maxY = Math.max(...children.map((c) => c.position.y + NODE_HEIGHT))

        const groupX = minX - GROUP_PADDING
        const groupY = minY - GROUP_PADDING
        const groupWidth = maxX - minX + GROUP_PADDING * 2
        const groupHeight = maxY - minY + GROUP_PADDING * 2

        // Adjust child positions to be relative to the group
        for (const child of children) {
            const positioned = leafById.get(child.id)
            if (positioned) {
                positioned.position = {
                    x: child.position.x - groupX,
                    y: child.position.y - groupY,
                }
            }
        }

        return {
            ...groupNode,
            position: { x: groupX, y: groupY },
            style: { ...groupNode.style, width: groupWidth, height: groupHeight },
        }
    })

    return [...positionedGroups, ...positionedLeaves]
}
