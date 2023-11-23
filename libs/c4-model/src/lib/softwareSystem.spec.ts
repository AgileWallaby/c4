import { SoftwareSystem } from "./softwareSystem"
import { faker } from '@faker-js/faker';

describe('SoftwareSystem', () => {

  describe('can be created', () => {
    const name = faker.word.words()
    const description = faker.word.words()
    const tags = faker.word.words().split(' ')

    const defaultTags = ["Element", "Software System"]

    test('can be created with name only', () => {
      const system = new SoftwareSystem(name);
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
    const defaultContainerTags = ["Element", "Container"]
    const containerTags = faker.word.words().split(' ')

    test('can define a container', () => {
      const system = new SoftwareSystem("system")
      const container = system.defineContainer(containerName)
      expect(container.name).toBe(containerName)
      expect(container.tags).toHaveLength(2)
      expect(container.tags).toEqual(expect.arrayContaining(defaultContainerTags))
    })

    test('can define a container with definition', () => {
      const system = new SoftwareSystem("system")
      const container = system.defineContainer(containerName, { description: containerDescription, tags: containerTags })
      expect(container.name).toBe(containerName)
      expect(container.description).toBe(containerDescription)
      expect(container.tags).toHaveLength(2 + containerTags.length)
      expect(container.tags).toEqual(expect.arrayContaining([...defaultContainerTags, ...containerTags]))
    })

    test('should not permit a container to be defined multiple times in the same software system', () => {
      const system = new SoftwareSystem("system")
      system.defineContainer(containerName)

      expect(() => system.defineContainer(containerName)).toThrow(`A Container named '${containerName}' is defined elsewhere in this SoftwareSystem. A Container can be defined only once, but can be referenced multiple times.`)
    })
  })
})
