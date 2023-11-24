import { Component } from './component'
import { Container } from './container'
import { Element } from './core'
import { SoftwareSystem } from './softwareSystem'

interface ViewDefinition<T extends Element> {
  subject?: T
  description: string
  title?: string
}

export class View<T extends Element> {

  public readonly subject?: T
  public readonly description: string
  public readonly title?: string

  private _scopes: string[] = []

  constructor(public readonly key: string, viewDefinition: ViewDefinition<T>) {
    this.description = viewDefinition.description
    this.subject = viewDefinition.subject
    this.title = viewDefinition.title
  }

  public includeAll() {
    this._scopes.push("include *")
  }

  public includeElement(element: T) {
    this._scopes.push(`include ${element.canonicalName}`)
  }

  public includeExpression(expression: string) {
    this._scopes.push(`include ${expression}`)
  }

  public excludeAll() {
    this._scopes.push("exclude *")
  }

  public excludeElement(element: T) {
    this._scopes.push(`exclude ${element.canonicalName}`)
  }

  public excludeExpression(expression: string) {
    this._scopes.push(`exclude ${expression}`)
  }

  public get scopes(): ReadonlyArray<string> {
    return this._scopes
  }
}

export class Views {

  private readonly _systemLandscapeViews = new Map<string, View<Element>>()
  private readonly _systemContextViews = new Map<string, View<SoftwareSystem>>()
  private readonly _containerViews = new Map<string, View<SoftwareSystem>>()
  private readonly _componentViews = new Map<string, View<Container>>()

  public addSystemLandscapeView(key: string, definition: ViewDefinition<Element>): View<Element> {
    const view = new View(key, { subject: undefined, description: definition.description, title: definition.title})
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
}
