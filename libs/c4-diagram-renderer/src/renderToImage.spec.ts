import { describe, it, expect } from 'vitest'
import type { WorkspaceJson } from '@c4/c4-parser'
import { renderToImage } from './renderToImage'

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
