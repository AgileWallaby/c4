import { TechnologyDefinition } from './core'

export type ElementKind = 'person' | 'softwareSystem' | 'container' | 'component'

export class ElementArchetype {
    readonly ownDescription?: string
    readonly ownTechnology?: string
    readonly ownTags: ReadonlyArray<string>
    readonly description?: string
    readonly technology?: string
    readonly tags: ReadonlyArray<string>

    constructor(
        public readonly name: string,
        public readonly elementKind: ElementKind,
        definition?: TechnologyDefinition,
        public readonly parent?: ElementArchetype
    ) {
        this.ownDescription = definition?.description
        this.ownTechnology = definition?.technology
        this.ownTags = definition?.tags ?? []

        this.description = this.ownDescription ?? parent?.description
        this.technology = this.ownTechnology ?? parent?.technology
        this.tags = [...(parent?.tags ?? []), ...this.ownTags]
    }
}

export class RelationshipArchetype {
    readonly ownDescription?: string
    readonly ownTechnology?: string
    readonly ownTags: ReadonlyArray<string>
    readonly description?: string
    readonly technology?: string
    readonly tags: ReadonlyArray<string>

    constructor(
        public readonly name: string,
        definition?: TechnologyDefinition,
        public readonly parent?: RelationshipArchetype
    ) {
        this.ownDescription = definition?.description
        this.ownTechnology = definition?.technology
        this.ownTags = definition?.tags ?? []

        this.description = this.ownDescription ?? parent?.description
        this.technology = this.ownTechnology ?? parent?.technology
        this.tags = [...(parent?.tags ?? []), ...this.ownTags]
    }
}

export function mergeArchetypeWithOverride(
    archetype: { description?: string; technology?: string; tags: ReadonlyArray<string> },
    override?: TechnologyDefinition
): TechnologyDefinition {
    return {
        description: override?.description ?? archetype.description,
        technology: override?.technology ?? archetype.technology,
        tags: [...archetype.tags, ...(override?.tags ?? [])],
    }
}
