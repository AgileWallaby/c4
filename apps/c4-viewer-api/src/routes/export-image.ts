import type { FastifyInstance } from 'fastify'
import type { Node, Edge } from '@xyflow/react'
import type { WorkspaceJson } from '@c4/c4-parser'
import type { RenderOptions } from '@c4/c4-diagram-renderer'
import { renderNodesToImage, renderToImage } from '@c4/c4-diagram-renderer'

interface ExportImageBody {
    workspace?: WorkspaceJson
    viewKey?: string
    nodes?: Node[]
    edges?: Edge[]
    options?: RenderOptions
}

export async function exportImageRoutes(app: FastifyInstance) {
    app.post('/api/export-image', async (request, reply) => {
        const { workspace, viewKey, nodes, edges, options } = request.body as ExportImageBody

        let png: Buffer
        if (nodes && edges) {
            png = await renderNodesToImage(nodes, edges, options)
        } else if (workspace && viewKey) {
            png = await renderToImage(workspace, viewKey, options)
        } else {
            return reply.status(400).send('Missing nodes+edges or workspace+viewKey')
        }

        return reply.header('Content-Type', 'image/png').header('Content-Length', png.length).send(png)
    })
}
