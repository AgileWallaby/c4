import { SoftwareSystem } from "./softwareSystem"
import { faker } from '@faker-js/faker';

describe('SoftwareSystem', () => {

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
      expect(system.tags).toEqual(expect.arrayContaining(defaultTags.concat(tags)))
    })

    test('with description and tags', () => {
      const system = new SoftwareSystem(name, { description, tags })
      expect(system.name).toBe(name)
      expect(system.description).toBe(description)
      expect(system.tags).toHaveLength(2 + tags.length)
      expect(system.tags).toEqual(expect.arrayContaining(defaultTags.concat(tags)))
    })
  })
})
