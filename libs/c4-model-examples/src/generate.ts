/* eslint-disable no-console */
import * as path from 'path'

import { generateDiagrams, Views } from '@agilewallaby/c4-model'

import type { ExampleSystemCatalog } from './catalog'

generateDiagrams<ExampleSystemCatalog>({
    searchRoot: __dirname,
    views: () => {
        const views = new Views()

        const landscape = views.addSystemLandscapeView('landscape', { description: 'System Landscape' })
        landscape.includeAll()

        return views
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
