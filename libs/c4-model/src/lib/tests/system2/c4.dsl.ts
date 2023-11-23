import { Model } from "../../model";

export function buildModel(model: Model) {
  model.referencePerson('person1')
  model.defineSoftwareSystem('softwareSystem1')
}
