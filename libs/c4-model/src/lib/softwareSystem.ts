import { Definition, Element, Group, Reference } from './core'
import { Container, ContainerDefinition, ReferencedContainer } from './container'

export interface SoftwareSystemDefinition extends Definition {
}

interface DefineContainer {
  defineContainer(name: string, definition?: ContainerDefinition): Container
}

export interface SoftwareSystemReference {
  name: string
}

export class SoftwareSystemGroup extends Group<Container> implements DefineContainer {
  private _containers = new Map<string, Container>()

  public constructor(public override readonly name: string,
    private readonly softwareSystem: DefineContainer) {
    super(name)
  }

  public defineContainer(name: string, definition?: ContainerDefinition): Container {
    const container = this.softwareSystem.defineContainer(name, definition)
    this._containers.set(name, container)
    return container
  }

  public getContainers(): ReadonlyArray<Container> {
    return Array.from(this._containers.values())
  }
}

export class SoftwareSystem extends Element implements DefineContainer {

  private _containers = new Map<string, Container>();
  private _groups = new Map<string, SoftwareSystemGroup>()

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

  public addGroup(groupName: string): SoftwareSystemGroup {
    let group = this._groups.get(groupName)
    if (!group) {
      group = new SoftwareSystemGroup(groupName, this)
      this._groups.set(groupName, group)
    }
    return group
  }

  public getGroups(): ReadonlyArray<SoftwareSystemGroup> {
    return Array.from(this._groups.values())
  }

  public getChildElements(): ReadonlyArray<Element> {
    return Array.from(this._containers.values())
  }

  public getContainersNotInGroups(): ReadonlyArray<Container> {
    const containersInGroups = Array.from(this._groups.values()).flatMap((group) => group.getContainers())
    return Array.from(this._containers.values()).filter((container) => !containersInGroups.includes(container))
  }
}

export class ReferencedSoftwareSystem extends Reference<Container> {

  public referenceContainer(name: string): ReferencedContainer {
    const containerReference = this.referenceChild(name, (name: string) => new ReferencedContainer(name))
    return containerReference as ReferencedContainer
  }
}


