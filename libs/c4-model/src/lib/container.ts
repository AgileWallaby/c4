import { Element, Reference, TechnicalElement, TechnologyDefinition } from "./core"
import { Component, ComponentDefinition, ReferencedComponent } from "./component"

export interface ContainerDefinition extends TechnologyDefinition {
}

export class Container extends TechnicalElement {

  private _components = new Map<string, Component>();

  constructor(public override readonly name: string, definition?: ContainerDefinition) {
    super(name, ["Container"], definition)
  }

  public defineComponent(name: string, definition?: ComponentDefinition): Component {
    if (this._components.has(name)) {
      throw Error(`A Component named '${name}' is defined elsewhere in this Container. A Component can be defined only once, but can be referenced multiple times.`)
    }

    const component = new Component(name, definition)

    this._components.set(name, component);

    return component
  }

  public getChildElements(): ReadonlyArray<Element> {
    return Array.from(this._components.values())
  }
}

export class ReferencedContainer extends Reference<Component> {
  public referenceComponent(name: string): ReferencedComponent {
    const componentReference = this.referenceChild(name, (name: string) => new ReferencedComponent(name))
    return componentReference as ReferencedComponent
  }
}
