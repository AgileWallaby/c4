/* eslint-disable no-console */
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

import { generateDiagrams } from '@agilewallaby/c4-model'

import type { ExampleSystemCatalog } from './catalog'
import { exampleArchetypes } from './catalog'

generateDiagrams<ExampleSystemCatalog>({
    searchRoot: __dirname,
    archetypes: exampleArchetypes,
    addViews: (views) => {
        views.addSystemLandscapeView('landscape', { description: 'System Landscape' }).with((v) => {
            v.includeAll()
        })
    },
    outputDir: path.join(__dirname, '..', 'diagrams'),
    format: ['mermaid', 'svg'],
})
    .then((files) => {
        console.log('Generated:')
        files.forEach((f) => console.log(' ', f))
    })
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
