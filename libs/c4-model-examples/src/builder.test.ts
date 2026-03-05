import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { buildModel, generateDiagrams, StructurizrDSLWriter, Views } from '@agilewallaby/c4-model'

import type { ExampleSystemCatalog } from './catalog'

describe('build model', () => {
    test('can build model', async () => {
        const model = await buildModel({ searchRoot: __dirname })
        const writer = new StructurizrDSLWriter(model, new Views())
        const dsl = writer.write()
        expect(dsl).toMatchSnapshot()
    })
})

describe('generateDiagrams', () => {
    test('produces .mmd and .png files', async () => {
        const outputDir = path.join(os.tmpdir(), `c4-diagrams-test-${Date.now()}`)

        const files = await generateDiagrams<ExampleSystemCatalog>({
            searchRoot: __dirname,
            views: (catalog) => {
                const views = new Views()
                const v = views.addSystemLandscapeView('landscape', { description: 'Landscape' })
                v.includeAll()
                return views
            },
            outputDir,
        })

        expect(files.some((f) => f.endsWith('.mmd'))).toBe(true)
        expect(files.some((f) => f.endsWith('.png'))).toBe(true)
        expect(files.every((f) => fs.existsSync(f))).toBe(true)

        await fs.promises.rm(outputDir, { recursive: true, force: true })
    }, 120_000)
})
