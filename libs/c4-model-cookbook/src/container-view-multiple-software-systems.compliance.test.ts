// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/container-view-multiple-software-systems

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

// example-1: container view with include * — only containers of the subject system are included
complianceSuite('cookbook: container-view-multiple-software-systems - include all', {
    buildModel() {
        const model = new Model()
        const s1 = model.softwareSystem('Software System 1')
        const c1 = s1.container('Container 1')
        const s2 = model.softwareSystem('Software System 2')
        const c2 = s2.container('Container 2')
        c1.uses(c2)

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: s1 })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    },
    dslPath: 'container-view-multiple-software-systems/example-1.dsl',
})

// example-2: container view with explicit include of containers from both systems
complianceSuite('cookbook: container-view-multiple-software-systems - explicit include', {
    buildModel() {
        const model = new Model()
        const s1 = model.softwareSystem('Software System 1')
        const c1 = s1.container('Container 1')
        const s2 = model.softwareSystem('Software System 2')
        const c2 = s2.container('Container 2')
        c1.uses(c2)

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: s1 })
        view.includeElement(c1)
        view.includeElement(c2)
        view.autoLayout('lr')
        return { model, views }
    },
    dslPath: 'container-view-multiple-software-systems/example-2.dsl',
})
