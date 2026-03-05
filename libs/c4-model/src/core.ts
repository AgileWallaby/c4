import { camelCase } from 'change-case'

export interface Definition {
    description?: string
    tags?: string[]
}

export interface TechnologyDefinition extends Definition {
    technology?: string
}

export abstract class Element {
    public readonly description?: string
    public readonly tags: ReadonlyArray<string>

    private _relationships: Relationship[] = []

    constructor(
        public readonly name: string,
        defaultTags: string[] = [],
        definition?: Definition
    ) {
        this.description = definition?.description
        this.tags = (definition?.tags ?? []).concat(['Element']).concat(defaultTags)
    }

    public get canonicalName(): string {
        return camelCase(this.name)
    }

    public uses(otherElement: Element, definition?: TechnologyDefinition): void {
        const relationship = new Relationship(this, otherElement, definition)
        this._relationships.push(relationship)
    }

    public get relationships(): ReadonlyArray<Relationship> {
        return this._relationships
    }

    public abstract getChildElements(): ReadonlyArray<Element>

    public getRelationshipsInHierarchy(): ReadonlyArray<Relationship> {
        return this._relationships.concat(this.getChildElements().flatMap((element) => element.getRelationshipsInHierarchy()))
    }

    public getChildElementNames(path?: string): ReadonlyArray<string> {
        const result = Array.from(this.getChildElements()).flatMap((reference) => {
            const currentPath = `${path ? path : '' + this.name}.${reference.name}`
            return [currentPath, ...reference.getChildElementNames(currentPath)]
        })
        return result
    }
}

export abstract class TechnicalElement extends Element {
    public readonly technology?: string

    constructor(name: string, defaultTags: string[] = [], definition?: TechnologyDefinition) {
        super(name, defaultTags, definition)
        this.technology = definition?.technology
    }
}

export class Relationship {
    public readonly description?: string
    public readonly tags: ReadonlyArray<string>
    public readonly technology?: string

    constructor(
        public readonly source: Element,
        public readonly destination: Element,
        definition?: TechnologyDefinition
    ) {
        this.description = definition?.description
        this.technology = definition?.technology
        this.tags = (definition?.tags ?? []).concat(['Relationship'])
    }
}

export class Group {
    public constructor(public readonly name: string) {}

    // TODO: Implement this in some useful way?
    // public addToGroup(groupCollection: string, groupMember: T) {}
}
