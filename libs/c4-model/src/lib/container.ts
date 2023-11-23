import { Element, Reference, Relationship, TechnologyDefinition } from "./core"
import { Component, ComponentDefinition, ReferencedComponent } from "./component"
import { Person } from "./person"
import { ReferencedSoftwareSystem, SoftwareSystem } from "./softwareSystem"

export interface ContainerDefinition extends TechnologyDefinition {

}

export class Container extends Element {

  private _relationships: Relationship[] = []
  private _components = new Map<string, Component>();

  constructor(public override readonly name: string, definition?: ContainerDefinition) {
    super(name, ["Container"], definition)
  }

  public uses(otherElement: Person | SoftwareSystem | ReferencedSoftwareSystem | Container | ReferencedContainer | Component | ReferencedComponent, definition?: TechnologyDefinition): void {
    const relationship = new Relationship(this, otherElement, definition)
    this._relationships.push(relationship)
  }

  public get relationships(): ReadonlyArray<Relationship> {
    return this._relationships
  }

  public defineComponent(name: string, definition?: ComponentDefinition): Component {
    if (this._components.has(name)) {
      throw Error(`A Component named '${name}' is defined elsewhere in this Container. A Component can be defined only once, but can be referenced multiple times.`)
    }

    const component = new Component(name, definition)

    this._components.set(name, component);

    return component
  }
}

export class ReferencedContainer extends Reference<Component> {
  public referenceComponent(name: string): ReferencedComponent {
    const componentReference = this.referenceChild(name, (name: string) => new ReferencedComponent(name))
    return componentReference as ReferencedComponent
  }
}
