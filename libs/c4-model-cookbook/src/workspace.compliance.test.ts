// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/workspace

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: workspace - name only', () => {
    // c4-model supports workspace name via Model constructor.
    // Workspace description is not yet supported.
    function buildModel() {
        const model = new Model('My Workspace')
        const views = new Views()
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

describe('cookbook: workspace - description', () => {
    test.todo('workspace description is not yet supported by c4-model (Model only accepts a name)')
})
