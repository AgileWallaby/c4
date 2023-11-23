import { Component } from './component';
import { faker } from '@faker-js/faker'

describe('Component', () => {

  const name = faker.word.words()
  const description = faker.word.words()
  const tags = faker.word.words().split(' ')

  const defaultTags = ["Element", "Component"]

  test('should be created with name only', () => {
    const component = new Component(name)
    expect(component.name).toBe(name)
    expect(component.description).toBeUndefined()
    expect(component.tags).toHaveLength(2)
    expect(component.tags).toEqual(expect.arrayContaining(defaultTags))
  })

  test('should be created with name and definition', () => {
    const component = new Component(name, { description, tags})
    expect(component.name).toBe(name)
    expect(component.description).toBe(description)
    expect(component.tags).toHaveLength(tags.length + 2)
    expect(component.tags).toEqual(expect.arrayContaining(defaultTags.concat(tags)))
  })
})
