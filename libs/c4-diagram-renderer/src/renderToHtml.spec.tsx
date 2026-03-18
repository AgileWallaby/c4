import { describe, it, expect } from 'vitest'
import type { WorkspaceJson } from '@c4/c4-parser'
import { parseView } from '@c4/c4-parser'
import { prepareNodesForSsr } from './prepareNodes'
import { renderToHtml } from './renderToHtml'

const workspace: WorkspaceJson = {
    name: 'Test',
    model: {
        people: [
            {
                id: '1',
                name: 'User',
                tags: 'Person',
                relationships: [
                    { id: 'r1', sourceId: '1', destinationId: '2', description: 'uses' },
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

describe('renderToHtml', () => {
    it('produces a valid HTML document string', () => {
        const { nodes, edges } = parseView(workspace, 'landscape')
        const ssrNodes = prepareNodesForSsr(nodes)
        const html = renderToHtml(ssrNodes, edges)

        expect(html).toContain('<!DOCTYPE html>')
        expect(html).toContain('<html>')
        expect(html).toContain('</html>')
    })

    it('includes React Flow CSS', () => {
        const { nodes, edges } = parseView(workspace, 'landscape')
        const ssrNodes = prepareNodesForSsr(nodes)
        const html = renderToHtml(ssrNodes, edges)

        // React Flow CSS contains the .react-flow class
        expect(html).toContain('.react-flow')
    })

    it('renders node labels in the HTML', () => {
        const { nodes, edges } = parseView(workspace, 'landscape')
        const ssrNodes = prepareNodesForSsr(nodes)
        const html = renderToHtml(ssrNodes, edges)

        expect(html).toContain('User')
        expect(html).toContain('System')
    })

    it('renders edge labels in the HTML', () => {
        const { nodes, edges } = parseView(workspace, 'landscape')
        const ssrNodes = prepareNodesForSsr(nodes)
        const html = renderToHtml(ssrNodes, edges)

        expect(html).toContain('uses')
    })

    it('respects width and height options', () => {
        const { nodes, edges } = parseView(workspace, 'landscape')
        const ssrNodes = prepareNodesForSsr(nodes)
        const html = renderToHtml(ssrNodes, edges, { width: 800, height: 600 })

        expect(html).toContain('width: 800px')
        expect(html).toContain('height: 600px')
    })
})
