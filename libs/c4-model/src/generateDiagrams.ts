import * as fs from 'fs'
import * as path from 'path'

import { BuildModelOptions, buildModel } from './buildModel'
import { createMermaidContainer, createStructurizrContainer, createStructurizrPlaywrightContainer } from './containers'
import { ensureAutoLayout } from './ensureAutoLayout'
import { StructurizrDSLWriter } from './structurizrDslWriter'
import { createTmpDir } from './tmpDir'

export type DiagramFormat = 'mermaid' | 'mermaid-png' | 'png' | 'svg'

const DEFAULT_FORMATS: DiagramFormat[] = ['mermaid', 'mermaid-png']

export interface GenerateDiagramsOptions<TRoot> extends BuildModelOptions<TRoot> {
    outputDir: string
    // What to produce for each view:
    // - 'mermaid'     Structurizr-generated Mermaid source (.mmd)
    // - 'mermaid-png' the .mmd above rendered to .png via mermaid-cli
    // - 'png'/'svg'   native Structurizr diagrams rendered via the Playwright image
    // Defaults to ['mermaid', 'mermaid-png'].
    format?: DiagramFormat | DiagramFormat[]
}

export async function generateDiagrams<TRoot>(options: GenerateDiagramsOptions<TRoot>): Promise<string[]> {
    const { outputDir, format, ...buildOptions } = options
    const formats = Array.isArray(format) ? format : format ? [format] : DEFAULT_FORMATS

    if (formats.includes('png') && formats.includes('mermaid-png')) {
        throw new Error("generateDiagrams: 'png' and 'mermaid-png' both write <view>.png files; request only one.")
    }

    // a) Build model, catalog, and views
    const { model, views } = await buildModel<TRoot>(buildOptions)

    // b) Native image export renders in a browser, so ensure every view has a layout
    const wantsNativeImage = formats.includes('png') || formats.includes('svg')
    if (wantsNativeImage) {
        ensureAutoLayout(views)
    }

    // c) Generate DSL string and write it to a temp directory (resolve symlinks for Docker mounts)
    const dsl = new StructurizrDSLWriter(model, views).write()
    const tmpDir = await createTmpDir('c4-diagrams-')
    await fs.promises.writeFile(path.join(tmpDir, 'workspace.dsl'), dsl, 'utf8')
    await fs.promises.mkdir(outputDir, { recursive: true })

    const generatedFiles: string[] = []

    // d) Mermaid: export .mmd via Structurizr CLI, optionally render each to .png via mermaid-cli
    const wantsMermaidText = formats.includes('mermaid')
    const wantsMermaidPng = formats.includes('mermaid-png')
    if (wantsMermaidText || wantsMermaidPng) {
        const logs: string[] = []
        try {
            await createStructurizrContainer(tmpDir, logs)
                .withCommand(['export', '-w', '/workspace/workspace.dsl', '-f', 'mermaid', '-o', '/workspace'])
                .start()
        } catch {
            throw new Error(`Structurizr mermaid export failed:\n${logs.join('')}`)
        }

        const mmdFiles = (await fs.promises.readdir(tmpDir)).filter((f) => f.endsWith('.mmd'))

        if (wantsMermaidText) {
            for (const file of mmdFiles) {
                await fs.promises.copyFile(path.join(tmpDir, file), path.join(outputDir, file))
                generatedFiles.push(path.join(outputDir, file))
            }
        }

        if (wantsMermaidPng) {
            for (const file of mmdFiles) {
                const pngFile = `${path.basename(file, '.mmd')}.png`
                await createMermaidContainer(tmpDir)
                    .withCommand(['-i', `/data/${file}`, '-o', `/data/${pngFile}`])
                    .start()
                await fs.promises.copyFile(path.join(tmpDir, pngFile), path.join(outputDir, pngFile))
                generatedFiles.push(path.join(outputDir, pngFile))
            }
        }
    }

    // e) Native PNG/SVG via the Structurizr Playwright image (also emits a <view>-key legend file)
    for (const imageFormat of ['png', 'svg'] as const) {
        if (!formats.includes(imageFormat)) continue
        const logs: string[] = []
        try {
            await createStructurizrPlaywrightContainer(tmpDir, logs)
                .withCommand(['export', '-w', '/workspace/workspace.dsl', '-f', imageFormat, '-o', '/workspace'])
                .start()
        } catch {
            throw new Error(`Structurizr ${imageFormat} export failed:\n${logs.join('')}`)
        }

        const imageFiles = (await fs.promises.readdir(tmpDir)).filter((f) => f.endsWith(`.${imageFormat}`))
        for (const file of imageFiles) {
            await fs.promises.copyFile(path.join(tmpDir, file), path.join(outputDir, file))
            generatedFiles.push(path.join(outputDir, file))
        }
    }

    return generatedFiles
}
