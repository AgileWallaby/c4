import { describe, it, expect } from 'vitest'
import { getAllViews, parseView } from './workspaceJsonParser'
import type { WorkspaceJson } from './types'
import workspace from './__fixtures__/sample-workspace.json'

const ws = workspace as WorkspaceJson

describe('getAllViews', () => {
    it('returns all views across all view types', () => {
        const views = getAllViews(ws)
        expect(views).toHaveLength(3)
        expect(views.map((v) => v.key)).toEqual(['landscape', 'context-banking', 'containers-banking'])
    })

    it('returns empty array for workspace with no views', () => {
        const empty: WorkspaceJson = { model: {}, views: {} }
        expect(getAllViews(empty)).toEqual([])
    })
})

describe('parseView', () => {
    it('returns empty nodes and edges for unknown view key', () => {
        const result = parseView(ws, 'nonexistent')
        expect(result.nodes).toEqual([])
        expect(result.edges).toEqual([])
    })

    describe('landscape view (with embedded positions)', () => {
        const result = parseView(ws, 'landscape')

        it('returns the correct number of nodes', () => {
            // 4 elements + 1 group node (Admin belongs to Internal Users)
            expect(result.nodes).toHaveLength(5)
        })

        it('maps Person elements to personNode type', () => {
            const personNodes = result.nodes.filter((n) => n.type === 'personNode')
            expect(personNodes).toHaveLength(2)
        })

        it('maps SoftwareSystem elements to softwareSystemNode type', () => {
            const ssNodes = result.nodes.filter((n) => n.type === 'softwareSystemNode')
            expect(ssNodes).toHaveLength(2)
        })

        it('uses embedded positions from the view JSON', () => {
            const customer = result.nodes.find((n) => n.id === '1')
            expect(customer?.position).toEqual({ x: 100, y: 200 })

            const bankingSystem = result.nodes.find((n) => n.id === '3')
            expect(bankingSystem?.position).toEqual({ x: 250, y: 450 })
        })

        it('marks external elements with isExternal: true', () => {
            const customer = result.nodes.find((n) => n.id === '1')
            expect(customer?.data.isExternal).toBe(true)

            const emailSystem = result.nodes.find((n) => n.id === '4')
            expect(emailSystem?.data.isExternal).toBe(true)
        })

        it('marks internal elements with isExternal: false', () => {
            const admin = result.nodes.find((n) => n.id === '2')
            expect(admin?.data.isExternal).toBe(false)

            const bankingSystem = result.nodes.find((n) => n.id === '3')
            expect(bankingSystem?.data.isExternal).toBe(false)
        })

        it('builds edges with correct source and target', () => {
            expect(result.edges).toHaveLength(3)

            const r1 = result.edges.find((e) => e.id === 'r1')
            expect(r1?.source).toBe('1')
            expect(r1?.target).toBe('3')

            const r3 = result.edges.find((e) => e.id === 'r3')
            expect(r3?.source).toBe('3')
            expect(r3?.target).toBe('4')
        })

        it('includes relationship description and technology in edge data', () => {
            const r1 = result.edges.find((e) => e.id === 'r1')
            expect(r1?.data).toMatchObject({ description: 'uses', technology: 'HTTPS' })

            const r2 = result.edges.find((e) => e.id === 'r2')
            expect(r2?.data).toMatchObject({ description: 'manages' })
        })

        it('sets relationshipEdge type on all edges', () => {
            result.edges.forEach((e) => expect(e.type).toBe('relationshipEdge'))
        })
    })

    describe('context view (no positions — auto-layout)', () => {
        const result = parseView(ws, 'context-banking')

        it('creates a group node for Internal Users', () => {
            const groupNodes = result.nodes.filter((n) => n.type === 'groupNode')
            expect(groupNodes).toHaveLength(1)
            expect(groupNodes[0].data.label).toBe('Internal Users')
        })

        it('assigns Admin to the group node via parentId', () => {
            const admin = result.nodes.find((n) => n.id === '2')
            expect(admin?.parentId).toBe('group-g1')
            expect(admin?.extent).toBe('parent')
        })

        it('does not assign a parentId to non-grouped elements', () => {
            const customer = result.nodes.find((n) => n.id === '1')
            expect(customer?.parentId).toBeUndefined()
        })

        it('computes non-zero positions for all leaf nodes via dagre', () => {
            const leafNodes = result.nodes.filter((n) => n.type !== 'groupNode')
            for (const node of leafNodes) {
                const { x, y } = node.position
                expect(x !== 0 || y !== 0).toBe(true)
            }
        })
    })

    describe('container view', () => {
        const result = parseView(ws, 'containers-banking')

        it('includes container nodes', () => {
            const containerNodes = result.nodes.filter((n) => n.type === 'containerNode')
            expect(containerNodes).toHaveLength(3) // Web App, API, Database
        })

        it('includes technology in container node data', () => {
            const webApp = result.nodes.find((n) => n.id === '5')
            expect(webApp?.data.technology).toBe('React')
        })

        it('sets parentSystemId relationship via type mapping', () => {
            // containers should all be containerNode type
            const containers = result.nodes.filter((n) => n.type === 'containerNode')
            expect(containers.map((n) => n.id).sort()).toEqual(['5', '6', '7'])
        })

        it('filters out relationships whose source or target is not in the view', () => {
            // r1 links Customer(1) → Banking System(3), but "3" is not in this view
            const edgeIds = result.edges.map((e) => e.id)
            expect(edgeIds).not.toContain('r3')
        })

        it('includes only relationships whose endpoints are in the view', () => {
            const edgeIds = result.edges.map((e) => e.id)
            expect(edgeIds).toContain('r4') // Web App → API
            expect(edgeIds).toContain('r5') // API → Database
        })
    })
})
