/* eslint-disable @typescript-eslint/no-unused-vars */

import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDSLWriter'
import { Views } from './views'
import { ElementArchetype, RelationshipArchetype } from './archetype'
import { validateModel } from './validateModel'

const TEST_TIMEOUT = 60_000

describe('can write to dsl', () => {
    test(
        'full model with all view types',
        async () => {
            const model = new Model('name')
            const person1 = model.person('person1')
            const person2 = model.person('person2')
            const grp1 = model.group('myGroup')
            const person3 = grp1.person('person3')
            const person4 = grp1.person('person4')
            const sys1 = model.softwareSystem('softwareSystem1', { description: 'description', tags: ['tag1', 'tag2'] })
            const cont1 = sys1.container('container1', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
            const comp1 = cont1.component('component1', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })

            const cont2 = sys1.container('container2', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
            const comp2 = cont2.component('component2', { description: 'description', technology: 'technology', tags: ['tag1', 'tag2'] })
            const sys2 = model.softwareSystem('softwareSystem2')
            const grp2 = sys2.group('grp2')
            const cont3 = grp2.container('container3')
            const comp3 = cont3.component('component3')
            const cont4 = grp2.container('container4')
            cont4.component('component5')
            cont4.group('anotherGroup').component('component4')

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

            const dsl = new StructurizrDSLWriter(model, views).write()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should output archetypes block when archetypes are used',
        async () => {
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
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should output relationship archetypes when used',
        async () => {
            const model = new Model('relArchModel')
            const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'] })
            const https = new RelationshipArchetype('https', { technology: 'HTTPS' }, sync)

            const person = model.person('user')
            const sys = model.softwareSystem('mySystem')
            person.uses(sys, https, { description: 'Makes API calls' })

            const views = new Views()
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should use camelCase identifiers for multi-word group names',
        async () => {
            const model = new Model('groupModel')
            const modelGroup = model.group('External Systems')
            modelGroup.softwareSystem('Email Service')

            const sys = model.softwareSystem('My System')
            const ssGroup = sys.group('Core Services')
            const container = ssGroup.container('API Server')

            const containerGroup = container.group('Domain Services')
            containerGroup.component('Auth Service')

            const views = new Views()
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should not output archetypes block when no archetypes are used',
        async () => {
            const model = new Model('noArchModel')
            model.softwareSystem('sys1')
            const views = new Views()
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'autoLayout - bare',
        async () => {
            const model = new Model('m')
            const views = new Views()
            const view = views.addSystemLandscapeView('sl', { description: 'desc' })
            view.autoLayout()
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'autoLayout - with direction',
        async () => {
            const model = new Model('m')
            const views = new Views()
            const view = views.addSystemLandscapeView('sl', { description: 'desc' })
            view.autoLayout('lr')
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'autoLayout - with direction and separations',
        async () => {
            const model = new Model('m')
            const views = new Views()
            const view = views.addSystemLandscapeView('sl', { description: 'desc' })
            view.autoLayout('tb', 300, 100)
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'default - marks view as default',
        async () => {
            const model = new Model('m')
            const views = new Views()
            const view = views.addSystemLandscapeView('sl', { description: 'desc' })
            view.setDefault()
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'per-view properties - emitted inside view block',
        async () => {
            const model = new Model('m')
            const views = new Views()
            const view = views.addSystemLandscapeView('sl', { description: 'desc' })
            view.addProperty('structurizr.sort', 'created')
            view.addProperty('custom.key', 'some value')
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'views-level properties - emitted inside views block',
        async () => {
            const model = new Model('m')
            const views = new Views()
            views.addProperty('structurizr.timezone', 'UTC')
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'styles - element style with multiple fields',
        async () => {
            const model = new Model('m')
            const views = new Views()
            views.addElementStyle('Database', {
                shape: 'Cylinder',
                background: '#336791',
                color: '#ffffff',
                fontSize: 14,
                border: 'solid',
            })
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'styles - relationship style',
        async () => {
            const model = new Model('m')
            const views = new Views()
            views.addRelationshipStyle('Synchronous', {
                thickness: 2,
                color: '#0000ff',
                style: 'solid',
                routing: 'Curved',
            })
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'themes - single theme uses "theme" keyword',
        async () => {
            const model = new Model('m')
            const views = new Views()
            views.addTheme('https://static.structurizr.com/themes/default/theme.json')
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'themes - multiple themes uses "themes" keyword',
        async () => {
            const model = new Model('m')
            const views = new Views()
            views.addTheme('default')
            views.addTheme('https://static.structurizr.com/themes/default/theme.json')
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'includeElement accepts Person on container view',
        async () => {
            const model = new Model('m')
            const person = model.person('alice')
            const sys = model.softwareSystem('MySystem')
            const views = new Views()
            // Container view is View<SoftwareSystem> — should accept Person (an Element)
            const containerView = views.addContainerView('cv', { subject: sys, description: 'desc' })
            containerView.includeElement(person)
            const dsl = new StructurizrDSLWriter(model, views).write()

            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )
})
