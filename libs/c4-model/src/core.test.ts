import { Relationship } from './core'
import { Container } from './container'
import { SoftwareSystem } from './softwareSystem'
import { RelationshipArchetype } from './archetype'

describe('Core', () => {
    test('Relationship', () => {
        const relationship = new Relationship(new Container('source'), new Container('destination'), {
            description: 'description',
            technology: 'technology',
            tags: ['tag1', 'tag2'],
        })
        expect(relationship.source.name).toBe('source')
        expect(relationship.destination.name).toBe('destination')
        expect(relationship.description).toBe('description')
        expect(relationship.technology).toBe('technology')
        expect(relationship.tags.length).toBe(3)
        expect(relationship.tags).toEqual(expect.arrayContaining(['Relationship', 'tag1', 'tag2']))
    })

    test('uses() with RelationshipArchetype', () => {
        const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'] })
        const https = new RelationshipArchetype('https', { technology: 'HTTPS' }, sync)

        const source = new Container('source')
        const dest = new Container('dest')
        source.uses(dest, https)

        expect(source.relationships).toHaveLength(1)
        const rel = source.relationships[0]
        expect(rel.technology).toBe('HTTPS')
        expect(rel.tags).toEqual(expect.arrayContaining(['Synchronous', 'Relationship']))
        expect(rel.archetype).toBe(https)
    })

    test('uses() with RelationshipArchetype and override', () => {
        const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'] })

        const source = new Container('source')
        const dest = new Container('dest')
        source.uses(dest, sync, { description: 'Makes API calls', tags: ['Custom'] })

        expect(source.relationships).toHaveLength(1)
        const rel = source.relationships[0]
        expect(rel.description).toBe('Makes API calls')
        expect(rel.tags).toEqual(expect.arrayContaining(['Synchronous', 'Custom', 'Relationship']))
        expect(rel.archetype).toBe(sync)
        expect(rel.overrideDefinition).toEqual({ description: 'Makes API calls', tags: ['Custom'] })
    })

    test('uses() without archetype remains backward compatible', () => {
        const source = new Container('source')
        const dest = new Container('dest')
        source.uses(dest, { description: 'sends data', technology: 'REST' })

        expect(source.relationships).toHaveLength(1)
        const rel = source.relationships[0]
        expect(rel.description).toBe('sends data')
        expect(rel.technology).toBe('REST')
        expect(rel.archetype).toBeUndefined()
    })

    describe('with()', () => {
        test('attaches children onto the element and returns the element', () => {
            const ss = new SoftwareSystem('My System')
            const result = ss.with((s) => ({
                webApp: s.container('Web App', { technology: 'React' }),
            }))

            expect(result).toBe(ss)
            expect(result.webApp.name).toBe('Web App')
            expect(result.webApp.technology).toBe('React')
        })

        test('children are registered in the parent internal map', () => {
            const ss = new SoftwareSystem('My System')
            const result = ss.with((s) => ({
                webApp: s.container('Web App'),
                database: s.container('Database'),
            }))

            const childNames = result.getChildElements().map((e) => e.name)
            expect(childNames).toContain('Web App')
            expect(childNames).toContain('Database')
        })

        test('works at Container→Component level', () => {
            const ss = new SoftwareSystem('My System')
            const result = ss.with((s) => ({
                api: s.container('API').with((c) => ({
                    notifier: c.component('Notifier', { technology: 'Node.js' }),
                })),
            }))

            expect(result.api.notifier.name).toBe('Notifier')
            expect(result.api.notifier.technology).toBe('Node.js')
            const apiChildren = result.api.getChildElements().map((e) => e.name)
            expect(apiChildren).toContain('Notifier')
        })

        test('TypeScript infers the full nested type', () => {
            const ss = new SoftwareSystem('My System')
            const result = ss.with((s) => ({
                webApp: s.container('Web App'),
            }))

            // If TypeScript didn't infer correctly this would be a type error
            const webApp: Container = result.webApp
            expect(webApp).toBeDefined()
        })
    })
})
