// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/dynamic-view-parallel

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

complianceSuite('cookbook: dynamic-view-parallel', {
    buildModel() {
        const model = new Model('Dynamic Parallel')
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        const d = model.softwareSystem('D')
        const e = model.softwareSystem('E')

        a.uses(b)
        b.uses(c)
        b.uses(d)
        b.uses(e)

        const views = new Views()
        views.addDynamicView('Dynamic', { subject: undefined }).with((v) => {
            v.addStep(a, b, 'Makes a request to')
            v.addParallel([
                [{ source: b, destination: c, description: 'Gets data from' }],
                [{ source: b, destination: d, description: 'Gets data from' }],
            ])
            v.addStep(b, e, 'Sends data to')
            v.autoLayout()
        })
        return { model, views }
    },
    validateOnly: true,
})
