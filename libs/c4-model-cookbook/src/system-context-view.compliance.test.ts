// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/system-context-view

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: system-context-view', () => {
    function buildModel() {
        const model = new Model('Getting Started')
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        user.uses(system, { description: 'Uses' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', {
            subject: system,
            description: 'An example of a System Context diagram.',
        })
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
