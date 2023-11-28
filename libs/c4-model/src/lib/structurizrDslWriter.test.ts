import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDSLWriter'
import { Views } from './views'

describe('can write to dsl', () => {
    test('', () => {
        const model = new Model('name')
        const person1 = model.definePerson('person1')
        const person2 = model.definePerson('person2')
        const grp1 = model.addGroup('myGroup')
        const person3 = grp1.definePerson('person3')
        const person4 = grp1.definePerson('person4')
        const sys1 = model.defineSoftwareSystem('softwareSystem1', { description: 'description', tags: ['tag1', 'tag2'] })
        const cont1 = sys1.defineContainer('container1', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
        const comp1 = cont1.defineComponent('component1', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })

        const cont2 = sys1.defineContainer('container2', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
        const comp2 = cont2.defineComponent('component2', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
        const sys2 = model.defineSoftwareSystem('softwareSystem2')
        const grp2 = sys2.addGroup('grp2')
        const cont3 = grp2.defineContainer('container3')
        const comp3 = cont3.defineComponent('component3')
        const cont4 = grp2.defineContainer('container4')
        cont4.defineComponent('component5')
        cont4.addGroup('anotherGroup').defineComponent('component4')

        const sys2ref = model.referenceSoftwareSystem('softwareSystem2')
        const cont3ref = sys2ref.referenceContainer('container3')
        const comp3ref = cont3ref.referenceComponent('component3')

        const person1ref = model.referencePerson('person1')

        person1.uses(person2, { description: 'description', tags: ['tag1', 'tag2'] })
        person2.uses(person1ref, { description: 'description', tags: ['tag1', 'tag2'] })

        person1.uses(sys1)
        person1.uses(sys2)

        person2.uses(sys1)

        sys1.uses(sys2)
        sys2.uses(sys1)

        const views = new Views()
        const landscapeView = views.addSystemLandscapeView('someName1', { description: 'someDescription' })
        landscapeView.includeAll()
        const contextView = views.addSystemContextView('someName', { subject: sys1, description: 'someDescription', title: 'My Title' })
        contextView.includeAll()

        const containerView = views.addContainerView('someName2s', { subject: sys1, description: 'someDescription' })
        containerView.includeAll()

        const componentView = views.addComponentView('someName3', {
            subject: cont1,
            description: 'someOtherDescripgtion',
            title: 'The Other Title',
        })
        componentView.includeAll()

        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()
        console.log(dsl)
        // Use the writer object here
    })
})
