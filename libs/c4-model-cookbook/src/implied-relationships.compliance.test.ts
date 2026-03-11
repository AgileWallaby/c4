// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/implied-relationships

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

// c4-model always generates implied relationships (Structurizr default behavior).
// Relationship between person and container implies a person→softwareSystem relationship.
complianceSuite('cookbook: implied-relationships - default behavior', {
    buildModel() {
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
    },
    dslPath: 'implied-relationships/example-1.dsl',
})

describe('cookbook: implied-relationships - disabling implied relationships', () => {
    // example-2: !impliedRelationships false
    test.todo('!impliedRelationships false keyword is not yet supported by c4-model')
})

complianceSuite('cookbook: implied-relationships - multiple relationships merged', {
    buildModel() {
        const model = new Model()
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        user.uses(webapp, { description: 'Uses 1' })
        user.uses(webapp, { description: 'Uses 2' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', { subject: system })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    },
    dslPath: 'implied-relationships/example-3.dsl',
})

complianceSuite('cookbook: implied-relationships - explicit at both levels', {
    buildModel() {
        const model = new Model()
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        user.uses(system, { description: 'Uses 1' })
        user.uses(system, { description: 'Uses 2' })
        user.uses(webapp, { description: 'Uses 1' })
        user.uses(webapp, { description: 'Uses 2' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', { subject: system })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    },
    dslPath: 'implied-relationships/example-4.dsl',
})
