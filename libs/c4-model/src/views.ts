import { Container } from './container'
import { Element } from './core'
import { SoftwareSystem } from './softwareSystem'

interface BaseViewDefinition {
    description?: string
    title?: string
}

interface ScopedViewDefinition<T extends Element> extends BaseViewDefinition {
    subject: T
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

export interface ViewBuilder {
    includeAll(): void
    includeElement(element: Element): void
    includeElements(elements: Element | Element[]): void
    includeExpression(expression: string): void
    includeExpressions(expressions: string | string[]): void
    excludeAll(): void
    excludeElement(element: Element): void
    excludeElements(elements: Element | Element[]): void
    excludeExpression(expression: string): void
    excludeExpressions(expressions: string | string[]): void
    autoLayout(direction?: AutoLayoutDirection, rankSeparation?: number, nodeSeparation?: number): void
    setDefault(): void
    addProperty(name: string, value: string): void
}

export interface ReadonlyView<T extends Element> {
    readonly key: string
    readonly subject?: T
    readonly description?: string
    readonly title?: string
    readonly scopes: ReadonlyArray<string>
    readonly autoLayoutConfig: AutoLayout | undefined
    readonly isDefault: boolean
    readonly properties: ReadonlyMap<string, string>
    includeAll(): void
    includeElement(element: Element): void
    includeElements(elements: Element | Element[]): void
    includeExpression(expression: string): void
    includeExpressions(expressions: string | string[]): void
    excludeAll(): void
    excludeElement(element: Element): void
    excludeElements(elements: Element | Element[]): void
    excludeExpression(expression: string): void
    excludeExpressions(expressions: string | string[]): void
    autoLayout(direction?: AutoLayoutDirection, rankSeparation?: number, nodeSeparation?: number): void
    setDefault(): void
    addProperty(name: string, value: string): void
    with(callback: (builder: ViewBuilder) => void): ReadonlyView<T>
}

export class View<T extends Element> implements ViewBuilder, ReadonlyView<T> {
    public readonly subject?: T
    public readonly description?: string
    public readonly title?: string

    private _scopes: string[] = []
    private _autoLayout?: AutoLayout
    private _isDefault = false
    private _properties = new Map<string, string>()

    constructor(
        public readonly key: string,
        viewDefinition: BaseViewDefinition & { subject?: T }
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

    public includeElements(elements: Element | Element[]) {
        ;[elements].flat().forEach(e => this.includeElement(e))
    }

    public includeExpression(expression: string) {
        this._scopes.push(`include ${expression}`)
    }

    public includeExpressions(expressions: string | string[]) {
        ;[expressions].flat().forEach(e => this.includeExpression(e))
    }

    public excludeAll() {
        this._scopes.push('exclude *')
    }

    public excludeElement(element: Element) {
        this._scopes.push(`exclude ${element.canonicalName}`)
    }

    public excludeElements(elements: Element | Element[]) {
        ;[elements].flat().forEach(e => this.excludeElement(e))
    }

    public excludeExpression(expression: string) {
        this._scopes.push(`exclude ${expression}`)
    }

    public excludeExpressions(expressions: string | string[]) {
        ;[expressions].flat().forEach(e => this.excludeExpression(e))
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

    public with(callback: (builder: ViewBuilder) => void): ReadonlyView<T> {
        callback(this)
        return this
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

export interface DynamicViewRelationshipStep {
    source: Element
    destination: Element
    description?: string
    technology?: string
}

export type DynamicViewStep = DynamicViewRelationshipStep | { parallel: DynamicViewRelationshipStep[][] }

export interface DynamicViewBuilder {
    addStep(source: Element, destination: Element, description?: string, technology?: string): void
    addParallel(sequences: DynamicViewRelationshipStep[][]): void
    autoLayout(direction?: AutoLayoutDirection, rankSeparation?: number, nodeSeparation?: number): void
    setDefault(): void
    addProperty(name: string, value: string): void
}

export interface ReadonlyDynamicView extends DynamicViewBuilder {
    readonly key: string
    readonly subject?: Element
    readonly description?: string
    readonly title?: string
    readonly steps: ReadonlyArray<DynamicViewStep>
    readonly autoLayoutConfig: AutoLayout | undefined
    readonly isDefault: boolean
    readonly properties: ReadonlyMap<string, string>
    with(callback: (builder: DynamicViewBuilder) => void): ReadonlyDynamicView
}

export class DynamicView implements DynamicViewBuilder, ReadonlyDynamicView {
    public readonly subject?: Element
    public readonly description?: string
    public readonly title?: string

    private _steps: DynamicViewStep[] = []
    private _autoLayout?: AutoLayout
    private _isDefault = false
    private _properties = new Map<string, string>()

    constructor(
        public readonly key: string,
        definition: { subject?: Element; description?: string; title?: string }
    ) {
        this.subject = definition.subject
        this.description = definition.description
        this.title = definition.title
    }

    public addStep(source: Element, destination: Element, description?: string, technology?: string): void {
        this._steps.push({ source, destination, description, technology })
    }

    public addParallel(sequences: DynamicViewRelationshipStep[][]): void {
        this._steps.push({ parallel: sequences })
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

    public with(callback: (builder: DynamicViewBuilder) => void): ReadonlyDynamicView {
        callback(this)
        return this
    }

    public get steps(): ReadonlyArray<DynamicViewStep> {
        return this._steps
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
    private readonly _dynamicViews = new Map<string, DynamicView>()
    private _elementStyles: ElementStyleEntry[] = []
    private _relationshipStyles: RelationshipStyleEntry[] = []
    private _themes: string[] = []
    private _properties = new Map<string, string>()

    public addSystemLandscapeView(key: string, definition: BaseViewDefinition): ReadonlyView<Element> {
        const view = new View(key, { subject: undefined, description: definition.description, title: definition.title })
        this._systemLandscapeViews.set(key, view)
        return view
    }

    public addSystemContextView(key: string, definition: ScopedViewDefinition<SoftwareSystem>): ReadonlyView<SoftwareSystem> {
        const view = new View(key, definition)
        this._systemContextViews.set(key, view)
        return view
    }

    public addContainerView(key: string, definition: ScopedViewDefinition<SoftwareSystem>): ReadonlyView<SoftwareSystem> {
        const view = new View(key, definition)
        this._containerViews.set(key, view)
        return view
    }

    public addComponentView(key: string, definition: ScopedViewDefinition<Container>): ReadonlyView<Container> {
        const view = new View(key, definition)
        this._componentViews.set(key, view)
        return view
    }

    public addDynamicView(key: string, definition: { subject?: Element; description?: string; title?: string }): ReadonlyDynamicView {
        const view = new DynamicView(key, definition)
        this._dynamicViews.set(key, view)
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

    public get systemLandscapeViews(): ReadonlyArray<ReadonlyView<Element>> {
        return Array.from(this._systemLandscapeViews.values())
    }

    public get systemContextViews(): ReadonlyArray<ReadonlyView<SoftwareSystem>> {
        return Array.from(this._systemContextViews.values())
    }

    public get containerViews(): ReadonlyArray<ReadonlyView<SoftwareSystem>> {
        return Array.from(this._containerViews.values())
    }

    public get componentViews(): ReadonlyArray<ReadonlyView<Container>> {
        return Array.from(this._componentViews.values())
    }

    public get dynamicViews(): ReadonlyArray<ReadonlyDynamicView> {
        return Array.from(this._dynamicViews.values())
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
