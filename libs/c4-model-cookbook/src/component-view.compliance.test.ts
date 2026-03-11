// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/component-view

import * as fs from 'fs'
import * as path from 'path'

import { Model, StructurizrDSLWriter, Views, exportWorkspaceJson, exportWorkspaceJsonFromDsl, validateModel } from '@agilewallaby/c4-model'

import { compareWorkspaceJsonSemantics } from './testUtils/compareWorkspaceJsonSemantics'

const TEST_TIMEOUT = 120_000

describe('cookbook: component-view', () => {
    function buildModel() {
        const model = new Model('Getting Started')
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        const c1 = webapp.component('Component 1')
        const c2 = webapp.component('Component 2')
        const database = system.container('Database')

        user.uses(c1, { description: 'Uses' })
        c1.uses(c2, { description: 'Uses' })
        c2.uses(database, { description: 'Reads from and writes to' })

        const views = new Views()
        const view = views.addComponentView('Components', { subject: webapp, description: 'An example of a Component diagram.' })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    }

    it('generates expected DSL', () => {
        const { model, views } = buildModel()
        const dsl = new StructurizrDSLWriter(model, views).write()
        expect(dsl).toMatchSnapshot()
    })

    it(
        'validates with Structurizr',
        async () => {
            const { model, views } = buildModel()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    it(
        'generated DSL is semantically equivalent to original cookbook DSL',
        async () => {
            const { model, views } = buildModel()
            const originalDsl = await fs.promises.readFile(path.join(import.meta.dirname, 'dsl/component-view/example-1.dsl'), 'utf8')
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})
