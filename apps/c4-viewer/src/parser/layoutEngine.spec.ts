import { describe, it, expect } from 'vitest'
import { computeLayout } from './layoutEngine'
import type { Node, Edge } from '@xyflow/react'

function makeNode(id: string, parentId?: string): Node {
    return {
        id,
        type: parentId ? 'softwareSystemNode' : 'softwareSystemNode',
        position: { x: 0, y: 0 },
        data: { label: id },
        ...(parentId ? { parentId, extent: 'parent' as const } : {}),
    }
}

function makeGroupNode(id: string): Node {
    return {
        id,
        type: 'groupNode',
        position: { x: 0, y: 0 },
        data: { label: id },
        style: { width: 200, height: 200 },
    }
}

function makeEdge(id: string, source: string, target: string): Edge {
    return { id, source, target, data: {} }
}

describe('computeLayout', () => {
    it('returns positioned nodes for a simple graph', () => {
        const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
        const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')]

        const result = computeLayout(nodes, edges)

        expect(result).toHaveLength(3)
        for (const node of result) {
            const { x, y } = node.position
            expect(typeof x).toBe('number')
            expect(typeof y).toBe('number')
            expect(isNaN(x)).toBe(false)
            expect(isNaN(y)).toBe(false)
        }
    })

    it('produces non-zero positions so nodes do not all stack at the origin', () => {
        const nodes = [makeNode('a'), makeNode('b'), makeNode('c')]
        const edges = [makeEdge('e1', 'a', 'b'), makeEdge('e2', 'b', 'c')]

        const result = computeLayout(nodes, edges)

        const allAtOrigin = result.every((n) => n.position.x === 0 && n.position.y === 0)
        expect(allAtOrigin).toBe(false)
    })

    it('returns empty array when given no nodes', () => {
        expect(computeLayout([], [])).toEqual([])
    })

    it('lays out a single node without crashing', () => {
        const result = computeLayout([makeNode('solo')], [])
        expect(result).toHaveLength(1)
    })

    it('uses TopBottom rankDirection by default', () => {
        // Two nodes connected top-to-bottom: b should have a greater y than a
        const nodes = [makeNode('a'), makeNode('b')]
        const edges = [makeEdge('e1', 'a', 'b')]

        const result = computeLayout(nodes, edges)
        const a = result.find((n) => n.id === 'a')!
        const b = result.find((n) => n.id === 'b')!

        expect(b.position.y).toBeGreaterThan(a.position.y)
    })

    it('uses LeftRight rankDirection when specified', () => {
        // Two nodes connected left-to-right: b should have a greater x than a
        const nodes = [makeNode('a'), makeNode('b')]
        const edges = [makeEdge('e1', 'a', 'b')]

        const result = computeLayout(nodes, edges, { rankDirection: 'LeftRight' })
        const a = result.find((n) => n.id === 'a')!
        const b = result.find((n) => n.id === 'b')!

        expect(b.position.x).toBeGreaterThan(a.position.x)
    })

    describe('group (parent) node sizing', () => {
        it('sizes a group node to wrap its children with padding', () => {
            const group = makeGroupNode('group-g1')
            const child1 = { ...makeNode('a'), parentId: 'group-g1', extent: 'parent' as const }
            const child2 = { ...makeNode('b'), parentId: 'group-g1', extent: 'parent' as const }
            const edge = makeEdge('e1', 'a', 'b')

            const result = computeLayout([group, child1, child2], [edge])

            const resultGroup = result.find((n) => n.id === 'group-g1')!
            expect(resultGroup.style?.width).toBeGreaterThan(0)
            expect(resultGroup.style?.height).toBeGreaterThan(0)
        })

        it('adjusts child positions to be relative to the group', () => {
            const group = makeGroupNode('group-g1')
            const child = { ...makeNode('a'), parentId: 'group-g1', extent: 'parent' as const }

            const result = computeLayout([group, child], [])

            const resultChild = result.find((n) => n.id === 'a')!
            // Child position should be relative to the group (non-negative, within padding)
            expect(resultChild.position.x).toBeGreaterThanOrEqual(0)
            expect(resultChild.position.y).toBeGreaterThanOrEqual(0)
        })

        it('places the group so it contains all children', () => {
            const group = makeGroupNode('group-g1')
            const child1 = { ...makeNode('a'), parentId: 'group-g1', extent: 'parent' as const }
            const child2 = { ...makeNode('b'), parentId: 'group-g1', extent: 'parent' as const }
            const edge = makeEdge('e1', 'a', 'b')

            const result = computeLayout([group, child1, child2], [edge])

            const resultGroup = result.find((n) => n.id === 'group-g1')!
            const children = result.filter((n) => n.parentId === 'group-g1')

            // All children should fit within the group's dimensions
            for (const child of children) {
                expect(child.position.x).toBeGreaterThanOrEqual(0)
                expect(child.position.y).toBeGreaterThanOrEqual(0)
                expect(child.position.x + 172).toBeLessThanOrEqual((resultGroup.style?.width as number) + 1)
                expect(child.position.y + 80).toBeLessThanOrEqual((resultGroup.style?.height as number) + 1)
            }
        })

        it('handles a group with no children gracefully', () => {
            const group = makeGroupNode('group-empty')
            const unrelated = makeNode('x')

            const result = computeLayout([group, unrelated], [])
            const resultGroup = result.find((n) => n.id === 'group-empty')!

            expect(resultGroup.style?.width).toBeGreaterThan(0)
            expect(resultGroup.style?.height).toBeGreaterThan(0)
        })
    })
})
