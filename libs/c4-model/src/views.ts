import { Container } from './container'
import { Element } from './core'
import { SoftwareSystem } from './softwareSystem'

interface ViewDefinition<T extends Element> {
    subject?: T
    description: string
    title?: string
}

export type AutoLayoutDirection = 'tb' | 'bt' | 'lr' | 'rl'

export interface AutoLayout {
    direction?: AutoLayoutDirection
    rankSeparation?: number
    nodeSeparation?: number
}

export type ElementShape =
    | 'Box'
    | 'RoundedBox'
    | 'Circle'
    | 'Ellipse'
    | 'Hexagon'
    | 'Diamond'
    | 'Cylinder'
    | 'Bucket'
    | 'Pipe'
    | 'Person'
    | 'Robot'
    | 'Folder'
    | 'WebBrowser'
    | 'Window'
    | 'Terminal'
    | 'Shell'
    | 'MobileDevicePortrait'
    | 'MobileDeviceLandscape'
    | 'Component'

export interface ElementStyleDefinition {
    shape?: ElementShape
    icon?: string
    width?: number
    height?: number
    background?: string
    color?: string
    stroke?: string
    strokeWidth?: number
    fontSize?: number
    border?: 'solid' | 'dashed' | 'dotted'
    opacity?: number
    metadata?: boolean
    description?: boolean
}

export interface RelationshipStyleDefinition {
    thickness?: number
    color?: string
    style?: 'solid' | 'dashed' | 'dotted'
    routing?: 'Direct' | 'Orthogonal' | 'Curved'
    fontSize?: number
    width?: number
    position?: number
    opacity?: number
}

export interface ElementStyleEntry {
    tag: string
    definition: ElementStyleDefinition
}

export interface RelationshipStyleEntry {
    tag: string
    definition: RelationshipStyleDefinition
}

export class View<T extends Element> {
    public readonly subject?: T
    public readonly description: string
    public readonly title?: string

    private _scopes: string[] = []
    private _autoLayout?: AutoLayout
    private _isDefault = false
    private _properties = new Map<string, string>()

    constructor(
        public readonly key: string,
        viewDefinition: ViewDefinition<T>
    ) {
        this.description = viewDefinition.description
        this.subject = viewDefinition.subject
        this.title = viewDefinition.title
    }

    public includeAll() {
        this._scopes.push('include *')
    }

    public includeElement(element: Element) {
        this._scopes.push(`include ${element.canonicalName}`)
    }

    public includeExpression(expression: string) {
        this._scopes.push(`include ${expression}`)
    }

    public excludeAll() {
        this._scopes.push('exclude *')
    }

    public excludeElement(element: Element) {
        this._scopes.push(`exclude ${element.canonicalName}`)
    }

    public excludeExpression(expression: string) {
        this._scopes.push(`exclude ${expression}`)
    }

    public autoLayout(direction?: AutoLayoutDirection, rankSeparation?: number, nodeSeparation?: number): void {
        this._autoLayout = { direction, rankSeparation, nodeSeparation }
    }

    public setDefault(): void {
        this._isDefault = true
    }

    public addProperty(name: string, value: string): void {
        this._properties.set(name, value)
    }

    public get scopes(): ReadonlyArray<string> {
        return this._scopes
    }

    public get autoLayoutConfig(): AutoLayout | undefined {
        return this._autoLayout
    }

    public get isDefault(): boolean {
        return this._isDefault
    }

    public get properties(): ReadonlyMap<string, string> {
        return this._properties
    }
}

export class Views {
    private readonly _systemLandscapeViews = new Map<string, View<Element>>()
    private readonly _systemContextViews = new Map<string, View<SoftwareSystem>>()
    private readonly _containerViews = new Map<string, View<SoftwareSystem>>()
    private readonly _componentViews = new Map<string, View<Container>>()
    private _elementStyles: ElementStyleEntry[] = []
    private _relationshipStyles: RelationshipStyleEntry[] = []
    private _themes: string[] = []
    private _properties = new Map<string, string>()

    public addSystemLandscapeView(key: string, definition: ViewDefinition<Element>): View<Element> {
        const view = new View(key, { subject: undefined, description: definition.description, title: definition.title })
        this._systemLandscapeViews.set(key, view)
        return view
    }

    public addSystemContextView(key: string, definition: ViewDefinition<SoftwareSystem>): View<SoftwareSystem> {
        const view = new View(key, definition)
        this._systemContextViews.set(key, view)
        return view
    }

    public addContainerView(key: string, definition: ViewDefinition<SoftwareSystem>): View<SoftwareSystem> {
        const view = new View(key, definition)
        this._containerViews.set(key, view)
        return view
    }

    public addComponentView(key: string, definition: ViewDefinition<Container>): View<Container> {
        const view = new View(key, definition)
        this._componentViews.set(key, view)
        return view
    }

    public addElementStyle(tag: string, definition: ElementStyleDefinition): void {
        this._elementStyles.push({ tag, definition })
    }

    public addRelationshipStyle(tag: string, definition: RelationshipStyleDefinition): void {
        this._relationshipStyles.push({ tag, definition })
    }

    public addTheme(url: string): void {
        this._themes.push(url)
    }

    public addProperty(name: string, value: string): void {
        this._properties.set(name, value)
    }

    public get systemLandscapeViews(): ReadonlyArray<View<Element>> {
        return Array.from(this._systemLandscapeViews.values())
    }

    public get systemContextViews(): ReadonlyArray<View<SoftwareSystem>> {
        return Array.from(this._systemContextViews.values())
    }

    public get containerViews(): ReadonlyArray<View<SoftwareSystem>> {
        return Array.from(this._containerViews.values())
    }

    public get componentViews(): ReadonlyArray<View<Container>> {
        return Array.from(this._componentViews.values())
    }

    public get elementStyles(): ReadonlyArray<ElementStyleEntry> {
        return this._elementStyles
    }

    public get relationshipStyles(): ReadonlyArray<RelationshipStyleEntry> {
        return this._relationshipStyles
    }

    public get themes(): ReadonlyArray<string> {
        return this._themes
    }

    public get properties(): ReadonlyMap<string, string> {
        return this._properties
    }
}
