// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/element-styles

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: element-styles - styling all elements', () => {
    function buildModel() {
        const model = new Model('ElementStyles')
        const a = model.softwareSystem('A')
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Element styles example.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Element', { background: '#1168bd', color: '#ffffff', shape: 'RoundedBox' })
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

describe('cookbook: element-styles - styling individual elements', () => {
    function buildModel() {
        const model = new Model('IndividualElementStyles')
        const a = model.softwareSystem('A', { tags: ['Tag 1'] })
        const b = model.softwareSystem('B')
        const c = model.softwareSystem('C')
        a.uses(b)
        b.uses(c)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Individual element styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Tag 1', { background: '#1168bd', color: '#ffffff', shape: 'RoundedBox' })
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
