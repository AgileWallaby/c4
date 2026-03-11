// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/implied-relationships

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: implied-relationships - default behavior', () => {
    // c4-model always generates implied relationships (Structurizr default behavior).
    // Relationship between person and container implies a person→softwareSystem relationship.
    function buildModel() {
        const model = new Model('ImpliedRelationships')
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        user.uses(webapp, { description: 'Uses' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', { subject: system, description: 'Implied relationships example.' })
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

describe('cookbook: implied-relationships - disabling implied relationships', () => {
    test.todo('!impliedRelationships false keyword is not yet supported by c4-model')
})
