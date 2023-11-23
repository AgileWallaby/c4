import { Component, ReferencedComponent } from './component';
import { Container, ReferencedContainer } from './container';
import { faker } from '@faker-js/faker'
import { ReferencedSoftwareSystem, SoftwareSystem } from './softwareSystem';
import { Person } from './person';

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

  test.each([
    new Container("otherContainer"),
    new Component("component"),
    new SoftwareSystem("softwareSystem"),
    new Person("person"),
    new ReferencedContainer("referencedContainer"),
    new ReferencedComponent("referencedComponent"),
    new ReferencedSoftwareSystem("referencedSoftwareSystem"),
  ])('can use other elements', (element) => {
    const component = new Component("component")
    component.uses(element)
    expect(component.relationships).toHaveLength(1)
    expect(component.relationships[0].destination).toBe(element)
  })


})
