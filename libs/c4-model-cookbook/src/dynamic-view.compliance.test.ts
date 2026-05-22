// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/dynamic-view

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

complianceSuite('cookbook: dynamic-view', {
    buildModel() {
        const model = new Model('Online Book Store')
        const customer = model.person('Customer')
        const onlineBookStore = model.softwareSystem('Online book store')
        const webapp = onlineBookStore.container('Web Application')
        const database = onlineBookStore.container('Database')

        customer.uses(webapp, { description: 'Browses and makes purchases using' })
        webapp.uses(database, { description: 'Reads from and writes to' })

        const views = new Views()
        views.addContainerView('Containers', { subject: onlineBookStore }).with((v) => {
            v.includeAll()
            v.autoLayout('lr')
        })
        views.addDynamicView('PastOrders', {
            subject: onlineBookStore,
            title: 'Request past orders feature',
        }).with((v) => {
            v.addStep(customer, webapp, 'Requests past orders from', 'HTTPS')
            v.addStep(webapp, database, 'Queries for orders using', 'SQL')
            v.autoLayout('lr')
        })
        views.addDynamicView('TopBooks', {
            subject: onlineBookStore,
            title: 'Browse top 20 books feature',
        }).with((v) => {
            v.addStep(customer, webapp, 'Requests the top 20 books from')
            v.addStep(webapp, database, 'Queries the top 20 books using')
            v.autoLayout('lr')
        })
        return { model, views }
    },
    validateOnly: true,
})
