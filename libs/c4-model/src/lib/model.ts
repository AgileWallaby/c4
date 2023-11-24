import { glob } from 'glob'
import { join } from 'path'

import { Group } from './core'
import { ReferencedSoftwareSystem, SoftwareSystem, SoftwareSystemDefinition } from './softwareSystem';
import { Person, PersonDefinition, ReferencedPerson } from './person'

interface DefineSoftwareSystem {
  defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem
}

interface DefinePerson {
  definePerson(name: string, definition?: PersonDefinition): Person
}

export class ModelGroup extends Group<SoftwareSystem | Person> implements DefineSoftwareSystem, DefinePerson {

  private softwareSystems = new Map<string, SoftwareSystem>()
  private people = new Map<string, Person>()

  public constructor(public override readonly name: string, private readonly model: DefineSoftwareSystem & DefinePerson) {
    super(name)
  }

  public defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
    const softwareSystem = this.model.defineSoftwareSystem(name, definition)
    this.softwareSystems.set(name, softwareSystem)
    return softwareSystem
  }

  public definePerson(name: string, definition?: PersonDefinition): Person {
    const person = this.model.definePerson(name, definition)
    this.people.set(name, person)
    return person
  }

  public getSoftwareSystems(): ReadonlyArray<SoftwareSystem> {
    return Array.from(this.softwareSystems.values())
  }

  public getPeople(): ReadonlyArray<Person> {
    return Array.from(this.people.values())
  }
}

export interface ModelDefinitions {
  defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem
  definePerson(name: string, definition?: PersonDefinition): Person
}

export class Model {
  constructor(public name: string) {}

  private softwareSystems = new Map<string, SoftwareSystem>();
  private referencedSoftwareSystems = new Map<string, ReferencedSoftwareSystem>();

  private people = new Map<string, Person>()
  private referencedPeople = new Map<string, ReferencedPerson>()

  private groups = new Map<string, ModelGroup>()

  defineSoftwareSystem(name: string, definition?: SoftwareSystemDefinition): SoftwareSystem {
    if (this.softwareSystems.has(name)) {
      throw Error(`A SoftwareSystem named '${name}' is defined elsewhere in this Model. A SoftwareSystem can be defined only once, but can be referenced multiple times.`)
    }
    const system = new SoftwareSystem(name, definition);
    this.softwareSystems.set(name, system);
    return system
  }

  addGroup(groupName: string): Group<SoftwareSystem | Person> & ModelDefinitions {
    let group = this.groups.get(groupName)
    if (!group) {
      group = new ModelGroup(groupName, this)
      this.groups.set(groupName, group)
    }
    return group
  }

  referenceSoftwareSystem(name:  string): ReferencedSoftwareSystem {
    let system = this.referencedSoftwareSystems.get(name);
    if (!system) {
      system = new ReferencedSoftwareSystem(name)
      this.referencedSoftwareSystems.set(name, system);
    }
    return system
  }

  definePerson(name: string, definition?: PersonDefinition): Person {
    if (this.people.has(name)) {
      throw Error(`A Person named '${name}' is defined elsewhere in this Model. A Person can be defined only once, but can be referenced multiple times.`)
    }
    const person = new Person(name, definition);
    this.people.set(name, person);
    return person
  }

  referencePerson(name: string): ReferencedPerson {
    let person = this.referencedPeople.get(name);
    if (!person) {
      person = new ReferencedPerson(name)
      this.referencedPeople.set(name, person);
    }
    return person
  }

  validate() {
    const undefinedSoftwareSystems = Array.from(this.referencedSoftwareSystems.keys()).filter(name => !this.softwareSystems.has(name));
    if (undefinedSoftwareSystems.length > 0) {
      throw Error(`SoftwareSystems named '${undefinedSoftwareSystems.join("', '")}' are referenced but not defined.`)
    }

    const undefinedPeople = Array.from(this.referencedPeople.keys()).filter(name => !this.people.has(name));
    if (undefinedPeople.length > 0) {
      throw Error(`People named '${undefinedPeople.join("', '")}' are referenced but not defined.`)
    }

    const definedElements = Array.from(this.softwareSystems.values()).flatMap(system => system.getChildElementNames())
    const referencedElements = Array.from(this.referencedSoftwareSystems.values()).flatMap(system => system.getChildElementNames())

    const undefinedElements = referencedElements.filter(name => !definedElements.includes(name))
    if (undefinedElements.length > 0) {
      throw Error(`Elements named '${undefinedElements.join("', '")}' are referenced but not defined.`)
    }
  }

  getPeople(): ReadonlyArray<Person> {
    return Array.from(this.people.values())
  }

  getSoftwareSystems(): ReadonlyArray<SoftwareSystem> {
    return Array.from(this.softwareSystems.values())
  }

  getPeopleNotInGroups(): ReadonlyArray<Person> {
    const peopleInGroups = Array.from(this.groups.values()).flatMap(group => group.getPeople())
    return Array.from(this.people.values()).filter(person => !peopleInGroups.includes(person))
  }

  getSoftwareSystemsNotInGroups(): ReadonlyArray<SoftwareSystem> {
    const systemsInGroups = Array.from(this.groups.values()).flatMap(group => group.getSoftwareSystems())
    return Array.from(this.softwareSystems.values()).filter(system => !systemsInGroups.includes(system))
  }

  getGroups(): ReadonlyArray<ModelGroup> {
    return Array.from(this.groups.values())
  }
}

export async function buildModel(modelName: string, globPath: string = 'c4.dsl.ts'): Promise<Model> {
  const model = new Model(modelName)

  const result = await glob(`**/${globPath}`, { cwd: __dirname })

  if (result.length === 0) {
    throw new Error(`No ${globPath} files found`)
  }

  for (const file of result) {
    const moduleFile = join(__dirname, file)
    console.log(`Accumulating model from ${moduleFile}`)

    const module = await import (moduleFile)
    if (typeof module.buildModel === 'function') {
      module.buildModel(model)
    }
    else {
      console.log(`${file} does not contain the method 'buildModel'`)
    }
  }

  model.validate()

  return model
}
