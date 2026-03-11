// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/container-view

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

complianceSuite('cookbook: container-view', {
    buildModel() {
        const model = new Model('Getting Started')
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        const database = system.container('Database')

        user.uses(webapp, { description: 'Uses' })
        webapp.uses(database, { description: 'Reads from and writes to' })

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: system, description: 'An example of a Container diagram.' })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    },
    dslPath: 'container-view/example-1.dsl',
})
