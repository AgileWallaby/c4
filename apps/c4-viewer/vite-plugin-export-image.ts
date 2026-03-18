import type { Plugin, ViteDevServer } from 'vite'

/**
 * Vite plugin that adds a `/api/export-image` endpoint to the dev server.
 * Accepts POST with `{ workspace, viewKey, options? }` and returns a PNG
 * rendered by the server-side diagram renderer (Playwright).
 */
export function exportImagePlugin(): Plugin {
    let server: ViteDevServer

    return {
        name: 'export-image',
        configureServer(s) {
            server = s
            s.middlewares.use('/api/export-image', async (req, res) => {
                if (req.method !== 'POST') {
                    res.statusCode = 405
                    res.end('Method not allowed')
                    return
                }

                try {
                    const body = await readBody(req)
                    const { workspace, viewKey, nodes, edges, options } = JSON.parse(body)

                    // Use ssrLoadModule so Vite resolves TS path aliases and transforms the code
                    const mod = await server.ssrLoadModule('@c4/c4-diagram-renderer')

                    let png: Buffer
                    if (nodes && edges) {
                        // Pre-positioned nodes from the viewer's current layout
                        png = await mod.renderNodesToImage(nodes, edges, options)
                    } else if (workspace && viewKey) {
                        // Legacy: parse from workspace JSON
                        png = await mod.renderToImage(workspace, viewKey, options)
                    } else {
                        res.statusCode = 400
                        res.end('Missing nodes+edges or workspace+viewKey')
                        return
                    }

                    res.setHeader('Content-Type', 'image/png')
                    res.setHeader('Content-Length', png.length)
                    res.end(png)
                } catch (err: unknown) {
                    console.error('[export-image]', err)
                    const message = err instanceof Error ? err.message : 'Internal server error'
                    res.statusCode = 500
                    res.end(message)
                }
            })
        },
    }
}

function readBody(req: import('http').IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
        req.on('error', reject)
    })
}
