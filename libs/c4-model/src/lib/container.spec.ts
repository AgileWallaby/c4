import { Container } from './container';
import { faker } from '@faker-js/faker'

describe('Container', () => {

  const name = faker.word.words()
  const description = faker.word.words()
  const tags = faker.word.words().split(' ')

  const defaultTags = ["Element", "Container"]

  test('should be created with name only', () => {
    const container = new Container(name)
    expect(container.name).toBe(name)
    expect(container.description).toBeUndefined()
    expect(container.tags).toHaveLength(2)
    expect(container.tags).toEqual(expect.arrayContaining(defaultTags))
  })

  test('should be created with name and definition', () => {
    const container = new Container(name, { description, tags})
    expect(container.name).toBe(name)
    expect(container.description).toBe(description)
    expect(container.tags).toHaveLength(tags.length + 2)
    expect(container.tags).toEqual(expect.arrayContaining(defaultTags.concat(tags)))
  })
})
