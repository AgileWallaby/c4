import { Definition, Element, Reference } from './core'

export interface PersonDefinition extends Definition {
}

export class Person extends Element {
  constructor(public override readonly name: string, definition?: PersonDefinition) {
    super(name, ["Person"], definition)
  }
}

export class ReferencedPerson extends Reference<undefined> {
}
