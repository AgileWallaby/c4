import { ensureAutoLayout } from './ensureAutoLayout'
import { Model } from './model'
import { Views } from './views'

describe('ensureAutoLayout', () => {
    let model: Model
    let views: Views

    beforeEach(() => {
        model = new Model('m')
        views = new Views()
    })

    test('injects the default direction into a view without autoLayout', () => {
        const view = views.addContainerView('cv', { subject: model.softwareSystem('Sys') })

        ensureAutoLayout(views)

        expect(view.autoLayoutConfig).toEqual({ direction: 'tb', rankSeparation: undefined, nodeSeparation: undefined })
    })

    test('respects a custom default direction', () => {
        const view = views.addSystemLandscapeView('landscape', {})

        ensureAutoLayout(views, 'lr')

        expect(view.autoLayoutConfig?.direction).toBe('lr')
    })

    test('leaves an explicitly configured autoLayout untouched', () => {
        const view = views.addContainerView('cv', { subject: model.softwareSystem('Sys') })
        view.autoLayout('rl', 300, 100)

        ensureAutoLayout(views)

        expect(view.autoLayoutConfig).toEqual({ direction: 'rl', rankSeparation: 300, nodeSeparation: 100 })
    })

    test('covers every view type including dynamic views', () => {
        const sys = model.softwareSystem('Sys')
        const landscape = views.addSystemLandscapeView('landscape', {})
        const context = views.addSystemContextView('ctx', { subject: sys })
        const dynamic = views.addDynamicView('dyn', { subject: sys })

        ensureAutoLayout(views)

        expect(landscape.autoLayoutConfig?.direction).toBe('tb')
        expect(context.autoLayoutConfig?.direction).toBe('tb')
        expect(dynamic.autoLayoutConfig?.direction).toBe('tb')
    })
})
