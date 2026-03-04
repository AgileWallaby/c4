import { Relationship } from './core'
import { Container } from './container'

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
})
