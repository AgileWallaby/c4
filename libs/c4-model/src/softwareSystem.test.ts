import { SoftwareSystem } from './softwareSystem'
import { faker } from '@faker-js/faker'
import { ElementArchetype } from './archetype'

describe('SoftwareSystem', () => {
    describe('can be created', () => {
        const name = faker.word.words()
        const description = faker.word.words()
        const tags = faker.word.words().split(' ')

        const defaultTags = ['Element', 'Software System']

        test('can be created with name only', () => {
            const system = new SoftwareSystem(name)
            expect(system.name).toBe(name)
            expect(system.tags).toHaveLength(2)
            expect(system.tags).toEqual(expect.arrayContaining(defaultTags))
        })

        describe('can be created with name and definition', () => {
            test('with description', () => {
                const system = new SoftwareSystem(name, { description })
                expect(system.name).toBe(name)
                expect(system.description).toBe(description)
                expect(system.tags).toEqual(expect.arrayContaining(defaultTags))
            })

            test('with tags', () => {
                const system = new SoftwareSystem(name, { tags })
                expect(system.name).toBe(name)
                expect(system.tags).toHaveLength(2 + tags.length)
                expect(system.tags).toEqual(expect.arrayContaining([...defaultTags, ...tags]))
            })

            test('with description and tags', () => {
                const system = new SoftwareSystem(name, { description, tags })
                expect(system.name).toBe(name)
                expect(system.description).toBe(description)
                expect(system.tags).toHaveLength(2 + tags.length)
                expect(system.tags).toEqual(expect.arrayContaining([...defaultTags, ...tags]))
            })
        })
    })

    describe('can define containers', () => {
        const containerName = faker.word.words()
        const containerDescription = faker.word.words()
        const defaultContainerTags = ['Element', 'Container']
        const containerTags = faker.word.words().split(' ')

        test('can define a container', () => {
            const system = new SoftwareSystem('system')
            const container = system.container(containerName)
            expect(container.name).toBe(containerName)
            expect(container.tags).toHaveLength(2)
            expect(container.tags).toEqual(expect.arrayContaining(defaultContainerTags))
        })

        test('can define a container with definition', () => {
            const system = new SoftwareSystem('system')
            const container = system.container(containerName, { description: containerDescription, tags: containerTags })
            expect(container.name).toBe(containerName)
            expect(container.description).toBe(containerDescription)
            expect(container.tags).toHaveLength(2 + containerTags.length)
            expect(container.tags).toEqual(expect.arrayContaining([...defaultContainerTags, ...containerTags]))
        })

        test('can define a container with archetype', () => {
            const arch = new ElementArchetype('springBoot', 'container', {
                technology: 'Spring Boot',
                tags: ['Application'],
            })
            const system = new SoftwareSystem('system')
            const container = system.container('api', arch)
            expect(container.name).toBe('api')
            expect(container.technology).toBe('Spring Boot')
            expect(container.tags).toEqual(expect.arrayContaining(['Application', 'Element', 'Container']))
            expect(container.archetype).toBe(arch)
        })

        test('can define a container with archetype and override', () => {
            const arch = new ElementArchetype('springBoot', 'container', {
                technology: 'Spring Boot',
                tags: ['Application'],
            })
            const system = new SoftwareSystem('system')
            const container = system.container('api', arch, { description: 'REST API', tags: ['REST'] })
            expect(container.technology).toBe('Spring Boot')
            expect(container.description).toBe('REST API')
            expect(container.tags).toEqual(expect.arrayContaining(['Application', 'REST', 'Element', 'Container']))
        })

        test('should not permit a container to be defined multiple times in the same software system', () => {
            const system = new SoftwareSystem('system')
            system.container(containerName)

            expect(() => system.container(containerName)).toThrow(
                `A Container named '${containerName}' is defined elsewhere in this SoftwareSystem. A Container can be defined only once.`
            )
        })
    })
})
