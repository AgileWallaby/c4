import { ReferencedSoftwareSystem, SoftwareSystem, SoftwareSystemDefinition } from './softwareSystem';

export class Model {
  constructor(public name: string) {}

  private softwareSystems = new Map<string, SoftwareSystem>();
  private referencedSoftwareSystems = new Map<string, ReferencedSoftwareSystem>();

  defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
    if (this.softwareSystems.has(name)) {
      throw Error(`A SoftwareSystem named '${name}' is defined elsewhere in this Model. A SoftwareSystem can be defined only once, but can be referenced multiple times.`)
    }
    const system = new SoftwareSystem(name, definition);
    this.softwareSystems.set(name, system);
    return system
  }

  referenceSoftwareSystem(name: string): ReferencedSoftwareSystem {
    let system = this.referencedSoftwareSystems.get(name);
    if (!system) {
      system = new ReferencedSoftwareSystem(name)
      this.referencedSoftwareSystems.set(name, system);
    }
    return system
  }

  validate() {
    const undefinedSoftwareSystems = Array.from(this.referencedSoftwareSystems.keys()).filter(name => !this.softwareSystems.has(name));
    if (undefinedSoftwareSystems.length > 0) {
      throw Error(`SoftwareSystems named '${undefinedSoftwareSystems.join("', '")}' are referenced but not defined.`)
    }
    const definedElements = Array.from(this.softwareSystems.values()).flatMap(system => system.getChildElements())
    const referencedElements = Array.from(this.referencedSoftwareSystems.values()).flatMap(system => system.getChildElements())

    const undefinedElements = referencedElements.filter(name => !definedElements.includes(name))
    if (undefinedElements.length > 0) {
      throw Error(`Elements named '${undefinedElements.join("', '")}' are referenced but not defined.`)
    }
  }
}
