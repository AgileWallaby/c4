export abstract class Element {
  constructor(public readonly name: string) {
  }
}

export class Relationship {
  constructor(public readonly source: Element, public readonly destination: Element, public readonly description: string) {
  }
}
