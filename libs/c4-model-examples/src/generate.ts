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
        const landscape = views.addSystemLandscapeView('landscape', { description: 'System Landscape' })
        landscape.includeAll()
    },
    outputDir: path.join(__dirname, '..', 'diagrams'),
})
    .then((files) => {
        console.log('Generated:')
        files.forEach((f) => console.log(' ', f))
    })
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
