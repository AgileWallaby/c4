import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { createStructurizrContainer } from './containers'
import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDslWriter'
import { Views } from './views'

export async function validateModel(model: Model, views: Views): Promise<void> {
    const dsl = new StructurizrDSLWriter(model, views).write()
    const tmpDir = await fs.promises.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), 'c4-validate-'))
    await fs.promises.chmod(tmpDir, 0o755)
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
