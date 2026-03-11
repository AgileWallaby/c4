// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/container-view-multiple-software-systems

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: container-view-multiple-software-systems', () => {
    function buildModel() {
        const model = new Model('MultiSystemContainerView')
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const aApp = a.container('App A')
        const bApp = b.container('App B')
        aApp.uses(bApp, { description: 'Uses' })

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: a, description: 'Container view showing multiple software systems.' })
        view.includeAll()
        view.includeElement(bApp)
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
