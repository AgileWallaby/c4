// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/themes

import * as fs from 'fs'
import * as path from 'path'

import { Model, StructurizrDSLWriter, Views, exportWorkspaceJson, exportWorkspaceJsonFromDsl, validateModel } from '@agilewallaby/c4-model'

import { compareWorkspaceJsonSemantics } from './testUtils/compareWorkspaceJsonSemantics'

const TEST_TIMEOUT = 120_000

describe('cookbook: themes - single theme (azure shorthand)', () => {
    // example-1: uses theme shorthand 'microsoft-azure-2021.01'
    // Note: validating this example requires network access to resolve the theme URL
    function buildModel() {
        const model = new Model()
        model.softwareSystem('Authentication Service', { tags: ['Microsoft Azure - Azure Active Directory'] })

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', {})
        view.includeAll()
        view.autoLayout('lr')
        views.addTheme('microsoft-azure-2021.01')
        return { model, views }
    }

    it('generates expected DSL', () => {
        const { model, views } = buildModel()
        const dsl = new StructurizrDSLWriter(model, views).write()
        expect(dsl).toMatchSnapshot()
    })

    // The 'microsoft-azure-2021.01' shorthand requires Structurizr to resolve the theme
    // by name from its registry, which requires network access not available in CI.
    it.todo('validates with Structurizr (requires network access for azure theme shorthand)')

    it.todo('generated DSL is semantically equivalent to original cookbook DSL (requires network access for azure theme shorthand)')
})

describe('cookbook: themes - theme with element styles', () => {
    // example-2: full URL theme plus element style override
    function buildModel() {
        const model = new Model('ThemesWithStyles')
        model.softwareSystem('Authentication Service', { tags: ['Microsoft Azure - Azure Active Directory'] })

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Theme with element styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Software System', { background: '#ffffff', shape: 'RoundedBox' })
        views.addTheme('https://static.structurizr.com/themes/microsoft-azure-2021.01.26/theme.json')
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

    it(
        'generated DSL is semantically equivalent to original cookbook DSL',
        async () => {
            const { model, views } = buildModel()
            const originalDsl = await fs.promises.readFile(path.join(import.meta.dirname, 'dsl/themes/example-2.dsl'), 'utf8')
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})
