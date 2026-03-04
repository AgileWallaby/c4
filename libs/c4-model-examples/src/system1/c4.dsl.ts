import { Model } from '@agilewallaby/c4-model'

export function buildModel(model: Model) {
    model.definePerson('person1')
    model.referenceSoftwareSystem('softwareSystem1')
}
