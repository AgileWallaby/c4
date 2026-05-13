import { describe, it, expect } from 'vitest'
import type { Node } from '@xyflow/react'
import { prepareNodesForSsr } from './prepareNodes'

describe('prepareNodesForSsr', () => {
    it('adds width and height to element nodes', () => {
        const nodes: Node[] = [
            { id: '1', type: 'personNode', position: { x: 0, y: 0 }, data: { label: 'User' } },
            { id: '2', type: 'softwareSystemNode', position: { x: 200, y: 0 }, data: { label: 'System' } },
        ]

        const result = prepareNodesForSsr(nodes)

        expect(result[0].width).toBe(172)
        expect(result[0].height).toBe(80)
        expect(result[1].width).toBe(172)
        expect(result[1].height).toBe(80)
    })

    it('adds handles to element nodes', () => {
        const nodes: Node[] = [
            { id: '1', type: 'personNode', position: { x: 0, y: 0 }, data: { label: 'User' } },
        ]

        const result = prepareNodesForSsr(nodes)

        expect(result[0].handles).toHaveLength(4)
        expect(result[0].handles![0]).toMatchObject({ type: 'target', x: 86, y: 0 })
        expect(result[0].handles![1]).toMatchObject({ type: 'source', x: 86, y: 80 })
    })

    it('uses style dimensions for group nodes', () => {
        const nodes: Node[] = [
            {
                id: 'g1',
                type: 'groupNode',
                position: { x: 0, y: 0 },
                data: { label: 'Group' },
                style: { width: 300, height: 250 },
            },
        ]

        const result = prepareNodesForSsr(nodes)

        expect(result[0].width).toBe(300)
        expect(result[0].height).toBe(250)
        expect(result[0].handles).toHaveLength(4)
        // Bottom handle should be at the height of the group
        expect(result[0].handles![1]).toMatchObject({ type: 'source', x: 150, y: 250 })
    })

    it('preserves existing node properties', () => {
        const nodes: Node[] = [
            {
                id: '1',
                type: 'containerNode',
                position: { x: 50, y: 100 },
                data: { label: 'API', technology: 'Node.js' },
                parentId: 'g1',
            },
        ]

        const result = prepareNodesForSsr(nodes)

        expect(result[0].position).toEqual({ x: 50, y: 100 })
        expect(result[0].data['label']).toBe('API')
        expect(result[0].parentId).toBe('g1')
    })
})
