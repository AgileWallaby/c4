import Fastify from 'fastify'
import cors from '@fastify/cors'
import { exportImageRoutes } from './routes/export-image'

async function main() {
    const server = Fastify({ logger: true })

    await server.register(cors)
    await server.register(exportImageRoutes)

    server.get('/health', async () => {
        return { status: 'ok' }
    })

    const port = Number(process.env['PORT'] ?? 3001)

    try {
        await server.listen({ port, host: 'localhost' })
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

main()
