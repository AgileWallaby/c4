import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { BuildModelOptions, buildModel } from './buildModel'
import { createMermaidContainer, createStructurizrContainer } from './containers'
import { StructurizrDSLWriter } from './structurizrDslWriter'

export interface GenerateDiagramsOptions<TRoot> extends BuildModelOptions<TRoot> {
    outputDir: string
}

export async function generateDiagrams<TRoot>(options: GenerateDiagramsOptions<TRoot>): Promise<string[]> {
    const { outputDir, ...buildOptions } = options

    // a) Build model, catalog, and views
    const { model, views } = await buildModel<TRoot>(buildOptions)

    // c) Generate DSL string
    const dsl = new StructurizrDSLWriter(model, views).write()

    // d) Write DSL to a temp directory (resolve symlinks so Docker bind mounts work on macOS)
    const tmpDir = await fs.promises.mkdtemp(path.join(fs.realpathSync(os.tmpdir()), 'c4-diagrams-'))
    await fs.promises.writeFile(path.join(tmpDir, 'workspace.dsl'), dsl, 'utf8')

    // e) Run Structurizr CLI container to export .mmd files
    const logs: string[] = []
    try {
        await createStructurizrContainer(tmpDir, logs)
            .withCommand(['export', '-w', '/workspace/workspace.dsl', '-f', 'mermaid', '-o', '/workspace'])
            .start()
    } catch {
        throw new Error(`Structurizr mermaid export failed:\n${logs.join('')}`)
    }

    // f) Copy .mmd files to outputDir
    await fs.promises.mkdir(outputDir, { recursive: true })
    const tmpFiles = await fs.promises.readdir(tmpDir)
    const mmdFiles = tmpFiles.filter((f) => f.endsWith('.mmd'))

    for (const file of mmdFiles) {
        await fs.promises.copyFile(path.join(tmpDir, file), path.join(outputDir, file))
    }

    const generatedFiles: string[] = mmdFiles.map((f) => path.join(outputDir, f))

    // g) For each .mmd file, render to .png via minlag/mermaid-cli container
    for (const file of mmdFiles) {
        const baseName = path.basename(file, '.mmd')
        const pngFile = `${baseName}.png`
        await createMermaidContainer(tmpDir)
            .withCommand(['-i', `/data/${file}`, '-o', `/data/${pngFile}`])
            .start()

        await fs.promises.copyFile(path.join(tmpDir, pngFile), path.join(outputDir, pngFile))
        generatedFiles.push(path.join(outputDir, pngFile))
    }

    // h) Return all generated file paths
    return generatedFiles
}
