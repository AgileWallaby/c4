import { Model } from "./model"
import { StructurizrDSLWriter } from "./structurizrDSLWriter"

describe('can write to dsl', () => {
  test('', () => {
    const model = new Model("name")
    const person1 = model.definePerson("person1")
    const person2 = model.definePerson("person2")
    const sys1 = model.defineSoftwareSystem("softwareSystem1", { description: "description", tags: ["tag1", "tag2"] })
    const cont1 = sys1.defineContainer("container1", { description: "description", technology: "technology", tags: ["tag1", "tag2"] })
    const comp1 = cont1.defineComponent("component1", { description: "description", technology: "technology", tags: ["tag1", "tag2"] })

    const cont2 = sys1.defineContainer("container2", { description: "description", technology: "technology", tags: ["tag1", "tag2"] })
    const comp2 = cont2.defineComponent("component2", { description: "description", technology: "technology", tags: ["tag1", "tag2"] })
    const sys2 = model.defineSoftwareSystem("softwareSystem2")
    const cont3 = sys2.defineContainer("container3")
    const comp3 = cont3.defineComponent("component3")

    comp3.uses(person1)

    const writer = new StructurizrDSLWriter(model)
    const dsl = writer.write()
    console.log(dsl)
    // Use the writer object here
  })
})
