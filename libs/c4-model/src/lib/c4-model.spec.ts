import { Model } from './c4-model';

describe('c4Model', () => {

  test('defining a software system should return system with provided name', () => {
    const model = new Model("model");
    const softwareSystem = model.defineSoftwareSystem("softwareSystem");
    expect(softwareSystem.name).toBe("softwareSystem");
  })

  test('should not permit a software system to be defined multiple times', () => {
    const model = new Model("model");
    model.defineSoftwareSystem("softwareSystem");
    expect(() => model.defineSoftwareSystem("softwareSystem")).toThrow("A software system named 'softwareSystem' is defined elsewhere. A software system can be defined only once, but can be referenced multiple times.");
  });

  test('should permit a software system to be referenced multiple times without being defined', () => {
    const model = new Model("model");
    const softwareSystem1 = model.referenceSoftwareSystem("softwareSystem");
    expect(softwareSystem1.name).toBe("softwareSystem");
    const softwareSystem2 = model.referenceSoftwareSystem("softwareSystem");
    expect(softwareSystem2.name).toBe("softwareSystem");
  })

  test('should validate a model by checking that all software systems that have been referenced have also been defined', () => {
    const model = new Model("model");
    model.defineSoftwareSystem("softwareSystem1");
    model.referenceSoftwareSystem("softwareSystem1");

    model.referenceSoftwareSystem("softwareSystem2");

    model.referenceSoftwareSystem("softwareSystem3");
    model.defineSoftwareSystem("softwareSystem3");

    model.referenceSoftwareSystem("softwareSystem4");

    expect(() => model.validate()).toThrow("Software systems named 'softwareSystem2', 'softwareSystem4' are referenced but not defined.");
  })
});
