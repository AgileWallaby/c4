import { AutoLayout, AutoLayoutDirection, Views } from './views'

interface LayoutableView {
    readonly autoLayoutConfig: AutoLayout | undefined
    autoLayout(direction?: AutoLayoutDirection, rankSeparation?: number, nodeSeparation?: number): void
}

// Native Structurizr image export renders views in a headless browser, so each view needs a
// layout. Give any view without an explicit autoLayout a sensible default so export works without
// a hand-positioned workspace.json.
export function ensureAutoLayout(views: Views, direction: AutoLayoutDirection = 'tb'): void {
    const all: LayoutableView[] = [
        ...views.systemLandscapeViews,
        ...views.systemContextViews,
        ...views.containerViews,
        ...views.componentViews,
        ...views.dynamicViews,
    ]
    for (const view of all) {
        if (!view.autoLayoutConfig) {
            view.autoLayout(direction)
        }
    }
}
