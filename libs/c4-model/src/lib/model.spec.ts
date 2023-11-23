import { Model } from './model';

describe('Model', () => {

  let model: Model

  beforeEach(() => {
    model = new Model("model")
  })

  describe('can define SoftwareSystems', () => {
    test('defining a SoftwareSystem should return system with provided name', () => {
      const softwareSystem = model.defineSoftwareSystem("softwareSystem")
      expect(softwareSystem.name).toBe("softwareSystem")
    })

    test('defining a SoftwareSystem with name and definition should return system with provided name and definition', () => {
      const softwareSystem = model.defineSoftwareSystem("softwareSystem", { description: "description", tags: ["tag1", "tag2"] })
      expect(softwareSystem.name).toBe("softwareSystem")
      expect(softwareSystem.description).toBe("description")
      expect(softwareSystem.tags.length).toBe(4)
      expect(softwareSystem.tags).toEqual(expect.arrayContaining(["tag1", "Element", "Software System", "tag2"]))
    })

    test('should not permit a SoftwareSystem to be defined multiple times', () => {
      model.defineSoftwareSystem("softwareSystem");
      expect(() => model.defineSoftwareSystem("softwareSystem")).toThrow("A SoftwareSystem named 'softwareSystem' is defined elsewhere in this Model. A SoftwareSystem can be defined only once, but can be referenced multiple times.");
    });
  })

  describe('can reference SoftwareSystems', () => {
    test('should permit a SoftwareSystem to be referenced multiple times without being defined', () => {
      const softwareSystem1 = model.referenceSoftwareSystem("softwareSystem");
      expect(softwareSystem1.name).toBe("softwareSystem");
      const softwareSystem2 = model.referenceSoftwareSystem("softwareSystem");
      expect(softwareSystem2.name).toBe("softwareSystem");
    })
  })

  describe('can define People', () => {
    test('defining a Person should return Person with provided name', () => {
      const person = model.definePerson("person")
      expect(person.name).toBe("person")
    })

    test('defining a Person with name and definition should return Person with provided name and definition', () => {
      const person = model.definePerson("person", { description: "description", tags: ["tag1", "tag2"] })
      expect(person.name).toBe("person")
      expect(person.description).toBe("description")
      expect(person.tags.length).toBe(4)
      expect(person.tags).toEqual(expect.arrayContaining(["tag1", "Element", "Person", "tag2"]))
    })
  })

  describe('can reference People', () => {
    test('should permit a Person to be referenced multiple times without being defined', () => {
      const person1 = model.referencePerson("person");
      expect(person1.name).toBe("person");
      const person2 = model.referencePerson("person");
      expect(person2.name).toBe("person");
    })
  })

  describe('can validate', () => {
    test('should validate a Model by checking that all SoftwareSystems that have been referenced have also been defined', () => {
      model.defineSoftwareSystem("softwareSystem1");
      model.referenceSoftwareSystem("softwareSystem1");

      model.referenceSoftwareSystem("softwareSystem2");
      model.referenceSoftwareSystem("softwareSystem2");

      model.referenceSoftwareSystem("softwareSystem2");
      model.defineSoftwareSystem("softwareSystem3");

      model.referenceSoftwareSystem("softwareSystem4");
      model.referenceSoftwareSystem("softwareSystem4");
      model.referenceSoftwareSystem("softwareSystem4");
      model.referenceSoftwareSystem("softwareSystem4");

      expect(() => model.validate()).toThrow("SoftwareSystems named 'softwareSystem2', 'softwareSystem4' are referenced but not defined.");
    })

    test('should validate a Model by checking that all Containers that have been referenced have also been defined', () => {
      const softwareSystem = model.defineSoftwareSystem("softwareSystem")
      softwareSystem.defineContainer("container2")
      const softwareSystemReference = model.referenceSoftwareSystem("softwareSystem")
      softwareSystemReference.referenceContainer("container1")
      softwareSystemReference.referenceContainer("container3")

      expect(() => model.validate()).toThrow("Elements named 'softwareSystem.container1', 'softwareSystem.container3' are referenced but not defined.")
    })
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
});
