import { Model } from '@agilewallaby/c4-model'

export function buildModel(model: Model) {
    model.referencePerson('person1')
    model.defineSoftwareSystem('softwareSystem1')
}
