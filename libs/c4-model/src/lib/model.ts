import { SoftwareSystem, SoftwareSystemDefinition } from './softwareSystem';

export class Model {
  constructor(public name: string) {}

  private softwareSystems = new Map<string, SoftwareSystem>();
  private referencedSoftwareSystems = new Map<string, SoftwareSystem>();

  defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
    if (this.softwareSystems.has(name)) {
      throw Error(`A SoftwareSystem named '${name}' is defined elsewhere in this Model. A SoftwareSystem can be defined only once, but can be referenced multiple times.`)
    }
    const system = new SoftwareSystem(name, definition);
    this.softwareSystems.set(name, system);
    return system
  }

  referenceSoftwareSystem(name: string): SoftwareSystem {
    let system = this.referencedSoftwareSystems.get(name);
    if (!system) {
      system = new SoftwareSystem(name)
      this.referencedSoftwareSystems.set(name, system);
    }
    return system
  }

  validate() {
    const undefinedSoftwareSystems = Array.from(this.referencedSoftwareSystems.keys()).filter(name => !this.softwareSystems.has(name));
    if (undefinedSoftwareSystems.length > 0) {
      throw Error(`SoftwareSystems named '${undefinedSoftwareSystems.join("', '")}' are referenced but not defined.`)
    }
  }
}
