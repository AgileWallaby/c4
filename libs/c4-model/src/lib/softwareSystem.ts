import { Element, Relationship } from './relationship'


export class Container extends Element {
  public description: string = ""
  public technology: string = ""
  public tags: string[] = []
}

export class Component extends Element {
  public description: string = ""
  public technology: string = ""
  public tags: string[] = []
}

export class SoftwareSystem extends Element {

  public description: string = ""
  public tags: string[] = []
  public relationships: Relationship[] = []

  constructor(public override readonly name: string) {
    super(name)
  }

  public uses(softwareSystem: SoftwareSystem, description: string): void {
    const relationship = new Relationship(this, softwareSystem, description)
    this.relationships.push(relationship)
  }
}
