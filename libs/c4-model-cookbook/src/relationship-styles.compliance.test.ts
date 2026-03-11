// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/relationship-styles

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

// example-1: no relationship styles
complianceSuite('cookbook: relationship-styles - baseline', {
    buildModel() {
        const model = new Model()
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', {})
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    },
    dslPath: 'relationship-styles/example-1.dsl',
})

complianceSuite('cookbook: relationship-styles - styling all relationships', {
    buildModel() {
        const model = new Model('RelationshipStyles')
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Relationship styles example.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addRelationshipStyle('Relationship', { color: '#ff0000', style: 'solid' })
        return { model, views }
    },
    dslPath: 'relationship-styles/example-2.dsl',
})

complianceSuite('cookbook: relationship-styles - styling individual relationships', {
    buildModel() {
        const model = new Model('IndividualRelationshipStyles')
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c, { tags: ['Tag 1'] })

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Individual relationship styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addRelationshipStyle('Tag 1', { color: '#ff0000', style: 'solid' })
        return { model, views }
    },
    dslPath: 'relationship-styles/example-3.dsl',
})
