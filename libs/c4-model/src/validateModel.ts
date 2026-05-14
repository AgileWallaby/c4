import * as fs from 'fs'
import * as path from 'path'

import { createStructurizrContainer } from './containers'
import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDslWriter'
import { createTmpDir } from './tmpDir'
import { Views } from './views'

export async function validateModel(model: Model, views: Views): Promise<void> {
    const dsl = new StructurizrDSLWriter(model, views).write()
    const tmpDir = await createTmpDir('c4-validate-')
    try {
        await fs.promises.writeFile(path.join(tmpDir, 'workspace.dsl'), dsl, 'utf8')

        const logs: string[] = []
        try {
            await createStructurizrContainer(tmpDir, logs)
                .withCommand(['validate', '-workspace', '/workspace/workspace.dsl'])
                .start()
        } catch {
            throw new Error(`Structurizr validation failed:\n${logs.join('')}`)
        }
    } finally {
        await fs.promises.rm(tmpDir, { recursive: true, force: true })
    }
}
