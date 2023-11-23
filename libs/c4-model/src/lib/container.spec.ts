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

  describe('can contain components', () => {

    const componentName = faker.word.words()
    const componentDescription = faker.word.words()
    const defaultComponentTags = ["Element", "Component"]
    const componentTags = faker.word.words().split(' ')

    test('can define a component', () => {
      const container = new Container("system")
      const component = container.defineComponent(componentName)
      expect(component.name).toBe(componentName)
      expect(component.tags).toHaveLength(2)
      expect(component.tags).toEqual(expect.arrayContaining(defaultComponentTags))
    })


    test('can define a container with definition', () => {
      const container = new Container("system")
      const component = container.defineComponent(componentName, { description: componentDescription, tags: componentTags })
      expect(component.name).toBe(componentName)
      expect(component.description).toBe(componentDescription)
      expect(component.tags).toHaveLength(2 + componentTags.length)
      expect(component.tags).toEqual(expect.arrayContaining([...defaultComponentTags, ...componentTags]))
    })

    test('should not permit a component to be defined multiple times in the same container', () => {
      const container = new Container("system")
      container.defineComponent(componentName)

      expect(() => container.defineComponent(componentName)).toThrow(`A Container named '${componentName}' is defined elsewhere in this SoftwareSystem. A Container can be defined only once, but can be referenced multiple times.`)
    })
  })
})
