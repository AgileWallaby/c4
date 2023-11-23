import { Model } from './model';

describe('Model', () => {

  let model: Model

  beforeEach(() => {
    model = new Model("model")
  })

  test('defining a software system should return system with provided name', () => {
    const softwareSystem = model.defineSoftwareSystem("softwareSystem")
    expect(softwareSystem.name).toBe("softwareSystem")
  })

  test('defining a software system with name and definition should return system with provided name and definition', () => {
    const softwareSystem = model.defineSoftwareSystem("softwareSystem", { description: "description", tags: ["tag1", "tag2"] })
    expect(softwareSystem.name).toBe("softwareSystem")
    expect(softwareSystem.description).toBe("description")
    expect(softwareSystem.tags.length).toBe(4)
    expect(softwareSystem.tags).toEqual(expect.arrayContaining(["tag1", "Element", "Software System", "tag2"]))

  })

  test('should not permit a software system to be defined multiple times', () => {
    model.defineSoftwareSystem("softwareSystem");
    expect(() => model.defineSoftwareSystem("softwareSystem")).toThrow("A SoftwareSystem named 'softwareSystem' is defined elsewhere in this Model. A SoftwareSystem can be defined only once, but can be referenced multiple times.");
  });

  test('should permit a software system to be referenced multiple times without being defined', () => {
    const softwareSystem1 = model.referenceSoftwareSystem("softwareSystem");
    expect(softwareSystem1.name).toBe("softwareSystem");
    const softwareSystem2 = model.referenceSoftwareSystem("softwareSystem");
    expect(softwareSystem2.name).toBe("softwareSystem");
  })

  test('should validate a model by checking that all software systems that have been referenced have also been defined', () => {
    model.defineSoftwareSystem("softwareSystem1");
    model.referenceSoftwareSystem("softwareSystem1");

    model.referenceSoftwareSystem("softwareSystem2");

    model.referenceSoftwareSystem("softwareSystem3");
    model.defineSoftwareSystem("softwareSystem3");

    model.referenceSoftwareSystem("softwareSystem4");

    expect(() => model.validate()).toThrow("SoftwareSystems named 'softwareSystem2', 'softwareSystem4' are referenced but not defined.");
  })

  test('should be able to define that one software system uses another', () => {
    const softwareSystem1 = model.defineSoftwareSystem("softwareSystem1");
    const softwareSystem2 = model.defineSoftwareSystem("softwareSystem2");
    softwareSystem1.uses(softwareSystem2, { description: "sends data to" });
    expect(softwareSystem1.relationships.length).toBe(1);
    expect(softwareSystem1.relationships[0].destination).toBe(softwareSystem2);
    expect(softwareSystem1.relationships[0].description).toBe("sends data to");
  })

  test('should be able to define a relationship between a defined software system and a referenced software system', () => {
    const softwareSystem1 = model.defineSoftwareSystem("softwareSystem1");
    const softwareSystem2 = model.referenceSoftwareSystem("softwareSystem2");
    softwareSystem1.uses(softwareSystem2,{ description: "sends data to" });
    expect(softwareSystem1.relationships.length).toBe(1);
    expect(softwareSystem1.relationships[0].destination).toBe(softwareSystem2);
  })

  test('should be able to define a relationship between a referenced software system and a defined software system', () => {
    const softwareSystem1 = model.referenceSoftwareSystem("softwareSystem1");
    const softwareSystem2 = model.defineSoftwareSystem("softwareSystem2");
    softwareSystem1.uses(softwareSystem2, { description: "sends data to" });
    expect(softwareSystem1.relationships.length).toBe(1);
    expect(softwareSystem1.relationships[0].destination).toBe(softwareSystem2);
  })

  test('compiler test', () => {
    const softwareSystem = model.referenceSoftwareSystem("softwareSystem1")
    softwareSystem.defineContainer("container1")
  })
});
