// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/component-view

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

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
})
