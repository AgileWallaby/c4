import { SoftwareSystem, SoftwareSystemDefinition } from './softwareSystem';

export class Model {
  constructor(public name: string) {}

  private softwareSystems = new Map<string, SoftwareSystem>();
  private referencedSoftwareSystems = new Map<string, SoftwareSystem>();

  defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
    if (this.softwareSystems.has(name)) {
      throw Error(`A software system named '${name}' is defined elsewhere. A software system can be defined only once, but can be referenced multiple times.`)
    }
    const system = new SoftwareSystem(name, definition);
    this.softwareSystems.set(name, system);
    return system
  }

  referenceSoftwareSystem(name: string): SoftwareSystem {
    let x = this.referencedSoftwareSystems.get(name);
    if (!x) {
      x = new SoftwareSystem(name)
      this.referencedSoftwareSystems.set(name, x);
    }
    return x
  }

  validate() {
    const undefinedSoftwareSystems = Array.from(this.referencedSoftwareSystems.keys()).filter(name => !this.softwareSystems.has(name));
    if (undefinedSoftwareSystems.length > 0) {
      throw Error(`Software systems named '${undefinedSoftwareSystems.join("', '")}' are referenced but not defined.`)
    }
  }
}
