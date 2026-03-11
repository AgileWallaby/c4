// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/bulk-operations-elements
//
// The cookbook uses the !elements DSL keyword for bulk relationship creation.
// c4-model achieves the same outcome by iterating containers in TypeScript.

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: bulk-operations-elements', () => {
    function buildModel() {
        const model = new Model('BulkOperations')
        const loggingService = model.softwareSystem('Logging Service')
        const a = model.softwareSystem('A')
        const app1 = a.container('App 1')
        const app2 = a.container('App 2')
        const app3 = a.container('App 3')

        // Equivalent of !elements "element.parent==a" { this -> loggingService "Sends logs to" }
        for (const app of [app1, app2, app3]) {
            app.uses(loggingService, { description: 'Sends logs to' })
        }

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: a, description: 'Bulk operations example.' })
        view.includeAll()
        view.autoLayout()
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
