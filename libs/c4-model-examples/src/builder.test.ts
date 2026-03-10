import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { buildModel, generateDiagrams, StructurizrDSLWriter, Views } from '@agilewallaby/c4-model'

import type { ExampleSystemCatalog } from './catalog'
import { exampleArchetypes } from './catalog'
import { c4Module as webPlatformModule } from './web-platform/c4.dsl'
import { c4Module as emailServiceModule } from './email-service/c4.dsl'

describe('build model', () => {
    test('can build model', async () => {
        const { model, buildViews } = await buildModel({ searchRoot: __dirname, archetypes: exampleArchetypes })
        const views = new Views()
        buildViews(views)
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()
        expect(dsl).toMatchSnapshot()
    })

    test('can build model with explicit modules', async () => {
        const { model, catalog, buildViews } = await buildModel<ExampleSystemCatalog>({
            modules: [webPlatformModule, emailServiceModule],
            archetypes: exampleArchetypes,
        })
        const views = new Views()
        buildViews(views)
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()
        expect(dsl).toMatchSnapshot()
        expect(catalog.webPlatform.webPlatform.name).toBe('Web Platform')
        expect(catalog.emailService.emailService.name).toBe('Email Service')
    })
})

describe('generateDiagrams', () => {
    test('produces .mmd and .png files', async () => {
        const outputDir = path.join(os.tmpdir(), `c4-diagrams-test-${Date.now()}`)

        const files = await generateDiagrams<ExampleSystemCatalog>({
            searchRoot: __dirname,
            archetypes: exampleArchetypes,
            viewsFactory: (views, catalog) => {
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
