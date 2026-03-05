import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { GenericContainer, Wait } from 'testcontainers'

import { BuildModelOptions, buildModelWithCatalog } from './model'
import { StructurizrDSLWriter } from './structurizrDslWriter'
import { Views } from './views'

export interface GenerateDiagramsOptions<TRoot> extends BuildModelOptions {
    views: (catalog: TRoot) => Views
    outputDir: string
}

export async function generateDiagrams<TRoot>(options: GenerateDiagramsOptions<TRoot>): Promise<string[]> {
    const { views: viewsFactory, outputDir, ...buildOptions } = options

    // a) Build model + catalog
    const { model, catalog } = await buildModelWithCatalog<TRoot>(buildOptions)

    // b) Build views from catalog via callback
    const views = viewsFactory(catalog)

    // c) Generate DSL string
    const dsl = new StructurizrDSLWriter(model, views).write()

    // d) Write DSL to a temp directory (resolve symlinks so Docker bind mounts work on macOS)
    const tmpDir = await fs.promises.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), 'c4-diagrams-'))
    await fs.promises.writeFile(path.join(tmpDir, 'workspace.dsl'), dsl, 'utf8')

    // e) Run Structurizr CLI container to export .mmd files
    await new GenericContainer('structurizr/structurizr')
        .withBindMounts([{ source: tmpDir, target: '/workspace', mode: 'rw' }])
        .withCommand(['export', '-w', '/workspace/workspace.dsl', '-f', 'mermaid', '-o', '/workspace'])
        .withWaitStrategy(Wait.forOneShotStartup())
        .start()

    // f) Copy .mmd files to outputDir
    await fs.promises.mkdir(outputDir, { recursive: true })
    const tmpFiles = await fs.promises.readdir(tmpDir)
    const mmdFiles = tmpFiles.filter((f) => f.endsWith('.mmd'))

    for (const file of mmdFiles) {
        await fs.promises.copyFile(path.join(tmpDir, file), path.join(outputDir, file))
    }

    const generatedFiles: string[] = mmdFiles.map((f) => path.join(outputDir, f))

    // g) For each .mmd file, run Mermaid CLI container to produce .png
    for (const file of mmdFiles) {
        const baseName = path.basename(file, '.mmd')
        await new GenericContainer('minlag/mermaid-cli')
            .withBindMounts([{ source: tmpDir, target: '/data', mode: 'rw' }])
            .withCommand(['-i', `/data/${file}`, '-o', `/data/${baseName}.png`])
            .withWaitStrategy(Wait.forOneShotStartup())
            .start()

        // h) Copy .png to outputDir
        const pngFile = `${baseName}.png`
        await fs.promises.copyFile(path.join(tmpDir, pngFile), path.join(outputDir, pngFile))
        generatedFiles.push(path.join(outputDir, pngFile))
    }

    // i) Return all generated file paths
    return generatedFiles
}
