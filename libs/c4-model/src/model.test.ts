import { Model } from './model'
import { ElementArchetype } from './archetype'

describe('Model', () => {
    let model: Model

    beforeEach(() => {
        model = new Model('model')
    })

    describe('can define SoftwareSystems', () => {
        test('defining a SoftwareSystem should return system with provided name', () => {
            const softwareSystem = model.softwareSystem('softwareSystem')
            expect(softwareSystem.name).toBe('softwareSystem')
        })

        test('defining a SoftwareSystem with name and definition should return system with provided name and definition', () => {
            const softwareSystem = model.softwareSystem('softwareSystem', { description: 'description', tags: ['tag1', 'tag2'] })
            expect(softwareSystem.name).toBe('softwareSystem')
            expect(softwareSystem.description).toBe('description')
            expect(softwareSystem.tags.length).toBe(4)
            expect(softwareSystem.tags).toEqual(expect.arrayContaining(['tag1', 'Element', 'Software System', 'tag2']))
        })

        test('should not permit a SoftwareSystem to be defined multiple times', () => {
            model.softwareSystem('softwareSystem')
            expect(() => model.softwareSystem('softwareSystem')).toThrow(
                "A SoftwareSystem named 'softwareSystem' is defined elsewhere in this Model. A SoftwareSystem can be defined only once."
            )
        })
    })

    describe('can define People', () => {
        test('defining a Person should return Person with provided name', () => {
            const person = model.person('person')
            expect(person.name).toBe('person')
        })

        test('defining a Person with name and definition should return Person with provided name and definition', () => {
            const person = model.person('person', { description: 'description', tags: ['tag1', 'tag2'] })
            expect(person.name).toBe('person')
            expect(person.description).toBe('description')
            expect(person.tags.length).toBe(4)
            expect(person.tags).toEqual(expect.arrayContaining(['tag1', 'Element', 'Person', 'tag2']))
        })
    })

    describe('can define SoftwareSystems with archetypes', () => {
        test('defining a SoftwareSystem with archetype should apply archetype properties', () => {
            const arch = new ElementArchetype('internalSystem', 'softwareSystem', {
                description: 'Internal system',
                tags: ['Internal'],
            })
            const system = model.softwareSystem('mySystem', arch)
            expect(system.name).toBe('mySystem')
            expect(system.description).toBe('Internal system')
            expect(system.tags).toEqual(expect.arrayContaining(['Internal', 'Element', 'Software System']))
            expect(system.archetype).toBe(arch)
        })

        test('defining a SoftwareSystem with archetype and override', () => {
            const arch = new ElementArchetype('internalSystem', 'softwareSystem', {
                description: 'Internal system',
                tags: ['Internal'],
            })
            const system = model.softwareSystem('mySystem', arch, { description: 'Override desc', tags: ['Extra'] })
            expect(system.description).toBe('Override desc')
            expect(system.tags).toEqual(expect.arrayContaining(['Internal', 'Extra', 'Element', 'Software System']))
            expect(system.overrideDefinition).toEqual({ description: 'Override desc', tags: ['Extra'] })
        })
    })

    describe('can define People with archetypes', () => {
        test('defining a Person with archetype should apply archetype properties', () => {
            const arch = new ElementArchetype('externalUser', 'person', {
                description: 'External user',
                tags: ['External'],
            })
            const person = model.person('user', arch)
            expect(person.name).toBe('user')
            expect(person.description).toBe('External user')
            expect(person.tags).toEqual(expect.arrayContaining(['External', 'Element', 'Person']))
            expect(person.archetype).toBe(arch)
        })

        test('defining a Person with archetype and override', () => {
            const arch = new ElementArchetype('externalUser', 'person', {
                description: 'External user',
                tags: ['External'],
            })
            const person = model.person('admin', arch, { description: 'Admin user' })
            expect(person.description).toBe('Admin user')
            expect(person.tags).toEqual(expect.arrayContaining(['External', 'Element', 'Person']))
        })
    })

    test('should be able to define that one software system uses another', () => {
        const softwareSystem1 = model.softwareSystem('softwareSystem1')
        const softwareSystem2 = model.softwareSystem('softwareSystem2')
        softwareSystem1.uses(softwareSystem2, { description: 'sends data to' })
        expect(softwareSystem1.relationships.length).toBe(1)
        expect(softwareSystem1.relationships[0].destination).toBe(softwareSystem2)
        expect(softwareSystem1.relationships[0].description).toBe('sends data to')
    })
})
