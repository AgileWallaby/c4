// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/themes

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

// example-1: uses theme shorthand 'microsoft-azure-2021.01'
// Note: validating this example requires network access to resolve the theme URL
complianceSuite('cookbook: themes - single theme (azure shorthand)', {
    buildModel() {
        const model = new Model()
        model.softwareSystem('Authentication Service', { tags: ['Microsoft Azure - Azure Active Directory'] })

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', {})
        view.includeAll()
        view.autoLayout('lr')
        views.addTheme('microsoft-azure-2021.01')
        return { model, views }
    },
    // The 'microsoft-azure-2021.01' shorthand requires Structurizr to resolve the theme
    // by name from its registry, which requires network access not available in CI.
    skipReason: 'requires network access for azure theme shorthand',
})

// example-2: full URL theme plus element style override
complianceSuite('cookbook: themes - theme with element styles', {
    buildModel() {
        const model = new Model('ThemesWithStyles')
        model.softwareSystem('Authentication Service', { tags: ['Microsoft Azure - Azure Active Directory'] })

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Theme with element styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Software System', { background: '#ffffff', shape: 'RoundedBox' })
        views.addTheme('https://static.structurizr.com/themes/microsoft-azure-2021.01.26/theme.json')
        return { model, views }
    },
    dslPath: 'themes/example-2.dsl',
})
