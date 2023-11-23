import { Model } from './model'

describe('scratch pad', () => {
  test('bump', () => {

  })

  test('it', () => {
    const model = new Model('model')
    const sys1 = model.defineSoftwareSystem('softwareSystem1')
    const sys1cont1 = sys1.defineContainer('container1')
    const sys1cont2 = sys1.defineContainer('container2')





    const sys2 = model.defineSoftwareSystem('softwareSystem2')
    const sys2cont1 = sys2.defineContainer('container1')
    const sys2cont2 = sys2.defineContainer('container2')
    const sys2cont2comp1 = sys2cont2.defineComponent('component1')

    const sys1ref = model.referenceSoftwareSystem('softwareSystem1')
    sys1ref.name // OK
    // sys1ref.relationships // NO!
    //sys1ref.uses(sys2cont1, { description: 'sends data to' })
    const sys1refcont1Ref = sys1ref.referenceContainer('container1')

    sys2cont1.uses(sys1refcont1Ref, { description: 'sends data to' })

    const sys1refcont1Refcomp1Ref = sys1refcont1Ref.referenceComponent('sdfsdf')
    sys2cont2.uses(sys1ref)
    sys2cont2.uses(sys1refcont1Ref)
    sys2cont2.uses(sys1refcont1Refcomp1Ref, { description: 'sends data to' })
  })

})
