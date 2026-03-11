// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/workspace

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

// c4-model supports workspace name via Model constructor.
// Workspace description is not yet supported.
complianceSuite('cookbook: workspace - name only', {
    buildModel() {
        const model = new Model('My Workspace')
        const views = new Views()
        return { model, views }
    },
    validateOnly: true,
})

describe('cookbook: workspace - description', () => {
    test.todo('workspace description is not yet supported by c4-model (Model only accepts a name)')
})
