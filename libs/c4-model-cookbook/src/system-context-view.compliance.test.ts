// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/system-context-view

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

complianceSuite('cookbook: system-context-view', {
    buildModel() {
        const model = new Model('Getting Started')
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        user.uses(system, { description: 'Uses' })

        const views = new Views()
        views.addSystemContextView('SystemContext', {
            subject: system,
            description: 'An example of a System Context diagram.',
        }).with((v) => {
            v.includeAll()
            v.autoLayout('lr')
        })
        return { model, views }
    },
    dslPath: 'system-context-view/example-1.dsl',
})
