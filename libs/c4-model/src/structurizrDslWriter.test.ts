/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */

import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDSLWriter'
import { Views } from './views'
import { ElementArchetype, RelationshipArchetype } from './archetype'

describe('can write to dsl', () => {
    test('', () => {
        const model = new Model('name')
        const person1 = model.person('person1')
        const person2 = model.person('person2')
        const grp1 = model.addGroup('myGroup')
        const person3 = grp1.person('person3')
        const person4 = grp1.person('person4')
        const sys1 = model.softwareSystem('softwareSystem1', { description: 'description', tags: ['tag1', 'tag2'] })
        const cont1 = sys1.container('container1', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
        const comp1 = cont1.component('component1', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })

        const cont2 = sys1.container('container2', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
        const comp2 = cont2.component('component2', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
        const sys2 = model.softwareSystem('softwareSystem2')
        const grp2 = sys2.addGroup('grp2')
        const cont3 = grp2.container('container3')
        const comp3 = cont3.component('component3')
        const cont4 = grp2.container('container4')
        cont4.component('component5')
        cont4.addGroup('anotherGroup').component('component4')

        person1.uses(person2, { description: 'description', tags: ['tag1', 'tag2'] })
        person2.uses(person1, { description: 'description', tags: ['tag1', 'tag2'] })

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

    test('should output archetypes block when archetypes are used', () => {
        const model = new Model('archModel')
        const springBoot = new ElementArchetype('springBootApp', 'container', {
            technology: 'Spring Boot',
            tags: ['Application'],
        })
        const microservice = new ElementArchetype(
            'microservice',
            'container',
            {
                tags: ['Microservice'],
            },
            springBoot
        )

        const sys = model.softwareSystem('mySystem')
        sys.container('Web App', springBoot)
        sys.container('API', microservice, { description: 'REST API' })

        const views = new Views()
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()

        // Should contain archetypes block
        expect(dsl).toContain('archetypes {')
        expect(dsl).toContain('springBootApp = container {')
        expect(dsl).toContain('technology "Spring Boot"')
        expect(dsl).toContain('tags "Application"')
        // Child archetype uses parent name as base type
        expect(dsl).toContain('microservice = springBootApp {')
        expect(dsl).toContain('tags "Microservice"')

        // Elements should use archetype name
        expect(dsl).toContain('webApp = springBootApp "Web App"')
        expect(dsl).toContain('api = microservice "API"')
        // Override description should appear on the element
        expect(dsl).toContain('description "REST API"')
    })

    test('should output relationship archetypes when used', () => {
        const model = new Model('relArchModel')
        const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'] })
        const https = new RelationshipArchetype('https', { technology: 'HTTPS' }, sync)

        const person = model.person('user')
        const sys = model.softwareSystem('mySystem')
        person.uses(sys, https, { description: 'Makes API calls' })

        const views = new Views()
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()

        // Should contain relationship archetypes
        expect(dsl).toContain('sync = -> {')
        expect(dsl).toContain('tags "Synchronous"')
        expect(dsl).toContain('https = --sync-> {')
        expect(dsl).toContain('technology "HTTPS"')

        // Relationship should use archetype arrow
        expect(dsl).toContain('user --https-> mySystem "Makes API calls"')
    })

    test('should not output archetypes block when no archetypes are used', () => {
        const model = new Model('noArchModel')
        model.softwareSystem('sys1')
        const views = new Views()
        const writer = new StructurizrDSLWriter(model, views)
        const dsl = writer.write()

        expect(dsl).not.toContain('archetypes')
    })
})
