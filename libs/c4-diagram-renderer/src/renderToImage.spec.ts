import { describe, it, expect } from 'vitest'
import type { WorkspaceJson } from '@c4/c4-parser'
import type { Node, Edge } from '@xyflow/react'
import { renderToImage, renderNodesToImage } from './renderToImage'

const workspace: WorkspaceJson = {
    name: 'Test',
    model: {
        people: [
            {
                id: '1',
                name: 'User',
                tags: 'Person',
                relationships: [
                    { id: 'r1', sourceId: '1', destinationId: '2', description: 'uses', technology: 'HTTPS' },
                ],
            },
        ],
        softwareSystems: [
            {
                id: '2',
                name: 'System',
                tags: 'SoftwareSystem',
            },
        ],
    },
    views: {
        systemLandscapeViews: [
            {
                key: 'landscape',
                elements: [{ id: '1', x: 100, y: 100 }, { id: '2', x: 400, y: 100 }],
                relationships: [{ id: 'r1' }],
            },
        ],
    },
}

describe('renderToImage', () => {
    it('produces a PNG buffer', async () => {
        const buffer = await renderToImage(workspace, 'landscape')

        // PNG magic bytes: 0x89 0x50 0x4E 0x47
        expect(buffer[0]).toBe(0x89)
        expect(buffer[1]).toBe(0x50) // P
        expect(buffer[2]).toBe(0x4e) // N
        expect(buffer[3]).toBe(0x47) // G
        expect(buffer.length).toBeGreaterThan(1000)
    })

    it('throws for unknown view key', async () => {
        await expect(renderToImage(workspace, 'nonexistent')).rejects.toThrow(
            'View "nonexistent" not found',
        )
    })

    it('respects custom dimensions', async () => {
        const small = await renderToImage(workspace, 'landscape', { width: 400, height: 300, deviceScaleFactor: 1 })
        const large = await renderToImage(workspace, 'landscape', { width: 1600, height: 1200, deviceScaleFactor: 1 })

        // Larger viewport should produce a larger image
        expect(large.length).toBeGreaterThan(small.length)
    })
})

const prePositionedNodes: Node[] = [
    { id: '1', type: 'personNode', position: { x: 100, y: 100 }, data: { label: 'User', description: '', technology: '' } },
    { id: '2', type: 'softwareSystemNode', position: { x: 400, y: 100 }, data: { label: 'System', description: '', technology: '' } },
]

const prePositionedEdges: Edge[] = [
    { id: 'r1', source: '1', target: '2', type: 'relationshipEdge', data: { label: 'uses', technology: 'HTTPS' } },
]

describe('renderNodesToImage', () => {
    it('produces a PNG buffer from pre-positioned nodes', async () => {
        const buffer = await renderNodesToImage(prePositionedNodes, prePositionedEdges)

        // PNG magic bytes: 0x89 0x50 0x4E 0x47
        expect(buffer[0]).toBe(0x89)
        expect(buffer[1]).toBe(0x50) // P
        expect(buffer[2]).toBe(0x4e) // N
        expect(buffer[3]).toBe(0x47) // G
        expect(buffer.length).toBeGreaterThan(1000)
    })

    it('throws when no nodes are provided', async () => {
        await expect(renderNodesToImage([], prePositionedEdges)).rejects.toThrow(
            'No nodes provided',
        )
    })

    it('respects custom dimensions', async () => {
        const small = await renderNodesToImage(prePositionedNodes, prePositionedEdges, { width: 400, height: 300, deviceScaleFactor: 1 })
        const large = await renderNodesToImage(prePositionedNodes, prePositionedEdges, { width: 1600, height: 1200, deviceScaleFactor: 1 })

        expect(large.length).toBeGreaterThan(small.length)
    })
})
