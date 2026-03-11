// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/themes

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

const TEST_TIMEOUT = 120_000

describe('cookbook: themes - single theme', () => {
    // The cookbook example uses the shorthand 'microsoft-azure-2021.01', which requires network
    // access to resolve. We use the default theme URL to demonstrate the same DSL pattern
    // with a theme the offline CLI can validate.
    function buildModel() {
        const model = new Model('Themes')
        model.softwareSystem('Authentication Service')

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Themes example.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addTheme('https://static.structurizr.com/themes/default/theme.json')
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

describe('cookbook: themes - theme with element styles', () => {
    function buildModel() {
        const model = new Model('ThemesWithStyles')
        model.softwareSystem('Authentication Service')

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Theme with styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Software System', { shape: 'RoundedBox' })
        views.addTheme('https://static.structurizr.com/themes/default/theme.json')
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
