// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/element-styles

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

// example-1: no element styles
complianceSuite('cookbook: element-styles - baseline', {
    buildModel() {
        const model = new Model()
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        views.addSystemLandscapeView('Landscape', {}).with((v) => {
            v.includeAll()
            v.autoLayout('lr')
        })
        return { model, views }
    },
    dslPath: 'element-styles/example-1.dsl',
})

complianceSuite('cookbook: element-styles - styling all elements', {
    buildModel() {
        const model = new Model('ElementStyles')
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        views.addSystemLandscapeView('Landscape', { description: 'Element styles example.' }).with((v) => {
            v.includeAll()
            v.autoLayout('lr')
        })
        views.addElementStyle('Element', { background: '#1168bd', color: '#ffffff', shape: 'RoundedBox' })
        return { model, views }
    },
    dslPath: 'element-styles/example-2.dsl',
})

complianceSuite('cookbook: element-styles - styling individual elements', {
    buildModel() {
        const model = new Model('IndividualElementStyles')
        const a = model.softwareSystem('A', { tags: ['Tag 1'] })
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        views.addSystemLandscapeView('Landscape', { description: 'Individual element styles.' }).with((v) => {
            v.includeAll()
            v.autoLayout('lr')
        })
        views.addElementStyle('Tag 1', { background: '#1168bd', color: '#ffffff', shape: 'RoundedBox' })
        return { model, views }
    },
    dslPath: 'element-styles/example-3.dsl',
})
