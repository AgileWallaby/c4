import { Definition, Element, Reference } from './core'
import { Container, ContainerDefinition, ReferencedContainer } from './container'

export interface SoftwareSystemDefinition extends Definition {
}

export interface SoftwareSystemReference {
  name: string
}

export class SoftwareSystem extends Element {

  private _containers = new Map<string, Container>();

  constructor(public override readonly name: string, definition?: SoftwareSystemDefinition) {
    super(name, ["Software System"], definition)
  }

  public defineContainer(name: string, definition?: ContainerDefinition): Container {
    if (this._containers.has(name)) {
      throw Error(`A Container named '${name}' is defined elsewhere in this SoftwareSystem. A Container can be defined only once, but can be referenced multiple times.`)
    }

    const container = new Container(name, definition)

    this._containers.set(name, container);

    return container
  }

  public getChildElements(): ReadonlyArray<Element> {
    return Array.from(this._containers.values())
  }
}

export class ReferencedSoftwareSystem extends Reference<Container> {

  public referenceContainer(name: string): ReferencedContainer {
    const containerReference = this.referenceChild(name, (name: string) => new ReferencedContainer(name))
    return containerReference as ReferencedContainer
  }
}


