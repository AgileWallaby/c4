import { ElementArchetype, RelationshipArchetype, mergeArchetypeWithOverride } from './archetype'

describe('ElementArchetype', () => {
    test('construction with no definition or parent', () => {
        const arch = new ElementArchetype('base', 'container')
        expect(arch.name).toBe('base')
        expect(arch.elementKind).toBe('container')
        expect(arch.ownTags).toEqual([])
        expect(arch.tags).toEqual([])
        expect(arch.description).toBeUndefined()
        expect(arch.technology).toBeUndefined()
        expect(arch.parent).toBeUndefined()
    })

    test('construction with definition', () => {
        const arch = new ElementArchetype('springBoot', 'container', {
            technology: 'Spring Boot',
            description: 'A Spring Boot app',
            tags: ['Application'],
        })
        expect(arch.ownTechnology).toBe('Spring Boot')
        expect(arch.ownDescription).toBe('A Spring Boot app')
        expect(arch.ownTags).toEqual(['Application'])
        expect(arch.technology).toBe('Spring Boot')
        expect(arch.description).toBe('A Spring Boot app')
        expect(arch.tags).toEqual(['Application'])
    })

    test('2-level inheritance', () => {
        const parent = new ElementArchetype('springBoot', 'container', {
            technology: 'Spring Boot',
            tags: ['Application'],
        })
        const child = new ElementArchetype(
            'microservice',
            'container',
            {
                tags: ['Microservice'],
            },
            parent
        )

        expect(child.technology).toBe('Spring Boot')
        expect(child.ownTechnology).toBeUndefined()
        expect(child.tags).toEqual(['Application', 'Microservice'])
        expect(child.ownTags).toEqual(['Microservice'])
        expect(child.parent).toBe(parent)
    })

    test('3-level inheritance chain', () => {
        const grandparent = new ElementArchetype('base', 'container', {
            technology: 'Java',
            description: 'Base service',
            tags: ['Service'],
        })
        const parent = new ElementArchetype(
            'springBoot',
            'container',
            {
                technology: 'Spring Boot',
                tags: ['Spring'],
            },
            grandparent
        )
        const child = new ElementArchetype(
            'microservice',
            'container',
            {
                description: 'Microservice',
                tags: ['Micro'],
            },
            parent
        )

        expect(child.technology).toBe('Spring Boot')
        expect(child.description).toBe('Microservice')
        expect(child.tags).toEqual(['Service', 'Spring', 'Micro'])
    })

    test('child description overrides parent', () => {
        const parent = new ElementArchetype('parent', 'softwareSystem', {
            description: 'Parent desc',
        })
        const child = new ElementArchetype(
            'child',
            'softwareSystem',
            {
                description: 'Child desc',
            },
            parent
        )

        expect(child.description).toBe('Child desc')
    })

    test('child inherits parent description when not specified', () => {
        const parent = new ElementArchetype('parent', 'softwareSystem', {
            description: 'Parent desc',
        })
        const child = new ElementArchetype('child', 'softwareSystem', {}, parent)

        expect(child.description).toBe('Parent desc')
    })
})

describe('RelationshipArchetype', () => {
    test('construction with no definition or parent', () => {
        const arch = new RelationshipArchetype('base')
        expect(arch.name).toBe('base')
        expect(arch.ownTags).toEqual([])
        expect(arch.tags).toEqual([])
        expect(arch.description).toBeUndefined()
        expect(arch.technology).toBeUndefined()
    })

    test('construction with definition', () => {
        const arch = new RelationshipArchetype('sync', {
            tags: ['Synchronous'],
            technology: 'HTTP',
        })
        expect(arch.ownTags).toEqual(['Synchronous'])
        expect(arch.tags).toEqual(['Synchronous'])
        expect(arch.technology).toBe('HTTP')
    })

    test('inheritance', () => {
        const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'] })
        const https = new RelationshipArchetype('https', { technology: 'HTTPS' }, sync)

        expect(https.tags).toEqual(['Synchronous'])
        expect(https.technology).toBe('HTTPS')
        expect(https.ownTags).toEqual([])
        expect(https.parent).toBe(sync)
    })

    test('3-level inheritance', () => {
        const base = new RelationshipArchetype('base', { tags: ['Base'] })
        const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'], description: 'Sync call' }, base)
        const https = new RelationshipArchetype('https', { technology: 'HTTPS' }, sync)

        expect(https.tags).toEqual(['Base', 'Synchronous'])
        expect(https.technology).toBe('HTTPS')
        expect(https.description).toBe('Sync call')
    })
})

describe('mergeArchetypeWithOverride', () => {
    test('no override returns archetype values', () => {
        const result = mergeArchetypeWithOverride({
            description: 'desc',
            technology: 'tech',
            tags: ['tag1'],
        })
        expect(result).toEqual({
            description: 'desc',
            technology: 'tech',
            tags: ['tag1'],
        })
    })

    test('override replaces description and technology', () => {
        const result = mergeArchetypeWithOverride(
            { description: 'arch desc', technology: 'arch tech', tags: ['tag1'] },
            { description: 'override desc', technology: 'override tech' }
        )
        expect(result.description).toBe('override desc')
        expect(result.technology).toBe('override tech')
        expect(result.tags).toEqual(['tag1'])
    })

    test('override tags are concatenated', () => {
        const result = mergeArchetypeWithOverride({ tags: ['tag1'] }, { tags: ['tag2', 'tag3'] })
        expect(result.tags).toEqual(['tag1', 'tag2', 'tag3'])
    })

    test('partial override', () => {
        const result = mergeArchetypeWithOverride({ description: 'arch', technology: 'tech', tags: ['t1'] }, { description: 'new desc' })
        expect(result.description).toBe('new desc')
        expect(result.technology).toBe('tech')
        expect(result.tags).toEqual(['t1'])
    })

    test('empty override', () => {
        const result = mergeArchetypeWithOverride({ description: 'desc', tags: ['t1'] }, {})
        expect(result.description).toBe('desc')
        expect(result.tags).toEqual(['t1'])
    })
})
