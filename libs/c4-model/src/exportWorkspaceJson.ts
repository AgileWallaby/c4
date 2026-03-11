import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { GenericContainer, Wait } from 'testcontainers'

import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDslWriter'
import { Views } from './views'

export async function exportWorkspaceJson(model: Model, views: Views): Promise<unknown> {
    const dsl = new StructurizrDSLWriter(model, views).write()
    const tmpDir = await fs.promises.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), 'c4-export-'))
    try {
        await fs.promises.writeFile(path.join(tmpDir, 'workspace.dsl'), dsl, 'utf8')

        const logs: string[] = []
        try {
            await new GenericContainer('structurizr/structurizr')
                .withBindMounts([{ source: tmpDir, target: '/workspace', mode: 'rw' }])
                .withCommand(['export', '-w', '/workspace/workspace.dsl', '-f', 'json', '-o', '/workspace'])
                .withWaitStrategy(Wait.forOneShotStartup())
                .withLogConsumer((stream) => stream.on('data', (chunk) => logs.push(chunk.toString())))
                .start()
        } catch {
            throw new Error(`Structurizr JSON export failed:\n${logs.join('')}`)
        }

        const files = await fs.promises.readdir(tmpDir)
        const jsonFile = files.find((f) => f.endsWith('.json'))
        if (!jsonFile) {
            throw new Error(`Structurizr JSON export produced no .json file. Files: ${files.join(', ')}`)
        }

        const jsonContent = await fs.promises.readFile(path.join(tmpDir, jsonFile), 'utf8')
        return JSON.parse(jsonContent)
    } finally {
        await fs.promises.rm(tmpDir, { recursive: true, force: true })
    }
}
