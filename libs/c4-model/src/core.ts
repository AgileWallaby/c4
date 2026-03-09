import { camelCase } from 'change-case'
import { ElementArchetype, RelationshipArchetype, mergeArchetypeWithOverride } from './archetype'

export interface Definition {
    description?: string
    tags?: string[]
}

export interface TechnologyDefinition extends Definition {
    technology?: string
}

export abstract class Element<TChild extends Element = never> {
    public readonly description?: string
    public readonly tags: ReadonlyArray<string>
    public readonly archetype?: ElementArchetype
    public readonly overrideDefinition?: TechnologyDefinition

    private _relationships: Relationship[] = []

    constructor(
        public readonly name: string,
        defaultTags: string[] = [],
        definition?: Definition,
        archetype?: ElementArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        this.description = definition?.description
        this.tags = (definition?.tags ?? []).concat(['Element']).concat(defaultTags)
        this.archetype = archetype
        this.overrideDefinition = overrideDefinition
    }

    public get canonicalName(): string {
        return camelCase(this.name)
    }

    public uses(
        otherElement: Element,
        archetypeOrDef?: RelationshipArchetype | TechnologyDefinition,
        override?: TechnologyDefinition
    ): void {
        let definition: TechnologyDefinition | undefined
        let archetype: RelationshipArchetype | undefined
        if (archetypeOrDef instanceof RelationshipArchetype) {
            archetype = archetypeOrDef
            definition = mergeArchetypeWithOverride(archetypeOrDef, override)
        } else {
            definition = archetypeOrDef
        }
        const relationship = new Relationship(this, otherElement, definition, archetype, override)
        this._relationships.push(relationship)
    }

    public get relationships(): ReadonlyArray<Relationship> {
        return this._relationships
    }

    public with<TChildren extends Record<string, TChild>>(callback: (self: this) => TChildren): this & TChildren {
        const children = callback(this)
        return Object.assign(this, children) as this & TChildren
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

export abstract class TechnicalElement<TChild extends Element = never> extends Element<TChild> {
    public readonly technology?: string

    constructor(
        name: string,
        defaultTags: string[] = [],
        definition?: TechnologyDefinition,
        archetype?: ElementArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        super(name, defaultTags, definition, archetype, overrideDefinition)
        this.technology = definition?.technology
    }
}

export class Relationship {
    public readonly description?: string
    public readonly tags: ReadonlyArray<string>
    public readonly technology?: string
    public readonly archetype?: RelationshipArchetype
    public readonly overrideDefinition?: TechnologyDefinition

    constructor(
        public readonly source: Element,
        public readonly destination: Element,
        definition?: TechnologyDefinition,
        archetype?: RelationshipArchetype,
        overrideDefinition?: TechnologyDefinition
    ) {
        this.description = definition?.description
        this.technology = definition?.technology
        this.tags = (definition?.tags ?? []).concat(['Relationship'])
        this.archetype = archetype
        this.overrideDefinition = overrideDefinition
    }
}

export class Group<TChild extends Element | Group = never> {
    public constructor(public readonly name: string) {}

    public get canonicalName(): string {
        return camelCase(this.name)
    }

    public with<TChildren extends Record<string, TChild>>(callback: (self: this) => TChildren): this & TChildren {
        const children = callback(this)
        return Object.assign(this, children) as this & TChildren
    }

    // TODO: Implement this in some useful way?
    // public addToGroup(groupCollection: string, groupMember: T) {}
}
