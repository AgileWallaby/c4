// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/relationship-styles

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: relationship-styles - styling all relationships', () => {
    function buildModel() {
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

describe('cookbook: relationship-styles - styling individual relationships', () => {
    function buildModel() {
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
