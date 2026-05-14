import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

export async function createTmpDir(prefix: string): Promise<string> {
    const tmpDir = await fs.promises.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), prefix))
    await fs.promises.chmod(tmpDir, 0o755)
    return tmpDir
}
