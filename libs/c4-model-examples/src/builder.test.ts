import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { buildModel, generateDiagrams, StructurizrDSLWriter, validateModel } from '@agilewallaby/c4-model'

import type { ExampleSystemCatalog } from './catalog'
import { exampleArchetypes } from './catalog'
import { c4Module as webPlatformModule } from './web-platform/c4.dsl'
import { c4Module as emailServiceModule } from './email-service/c4.dsl'

describe('build model', () => {
    test('can build model', async () => {
        const { model, views } = await buildModel({ searchRoot: __dirname, archetypes: exampleArchetypes })
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()
        expect(dsl).toMatchSnapshot()
        await validateModel(model, views)
    }, 120_000)

    test('can build model with explicit modules', async () => {
        const { model, catalog, views } = await buildModel<ExampleSystemCatalog>({
            modules: [webPlatformModule, emailServiceModule],
            archetypes: exampleArchetypes,
        })
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()
        expect(dsl).toMatchSnapshot()
        expect(catalog.webPlatform.webPlatform.name).toBe('Web Platform')
        expect(catalog.emailService.emailService.name).toBe('Email Service')
        await validateModel(model, views)
    }, 120_000)
})

describe('generateDiagrams', () => {
    test('produces .mmd and .png files', async () => {
        const outputDir = path.join(os.tmpdir(), `c4-diagrams-test-${Date.now()}`)

        const files = await generateDiagrams<ExampleSystemCatalog>({
            searchRoot: __dirname,
            archetypes: exampleArchetypes,
            addViews: (views) => {
                const v = views.addSystemLandscapeView('landscape', { description: 'Landscape' })
                v.includeAll()
            },
            outputDir,
        })

        expect(files.some((f) => f.endsWith('.mmd'))).toBe(true)
        expect(files.some((f) => f.endsWith('.png'))).toBe(true)
        expect(files.every((f) => fs.existsSync(f))).toBe(true)

        await fs.promises.rm(outputDir, { recursive: true, force: true })
    }, 120_000)
})
