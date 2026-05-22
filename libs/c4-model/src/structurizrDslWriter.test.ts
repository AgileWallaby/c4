/* eslint-disable @typescript-eslint/no-unused-vars */

import { Model } from './model'
import { StructurizrDSLWriter } from './structurizrDslWriter'
import { Views } from './views'
import { ELEMENT_KINDS, ElementArchetype, RelationshipArchetype } from './archetype'
import { validateModel } from './validateModel'

const TEST_TIMEOUT = 60_000

describe('can write to dsl', () => {
    let model: Model
    let views: Views

    beforeEach(() => {
        model = new Model('m')
        views = new Views()
    })

    const writeDsl = () => new StructurizrDSLWriter(model, views).write()

    test(
        'full model with all view types',
        async () => {
            model = new Model('name')
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

            views.addSystemLandscapeView('someName1', { description: 'someDescription' }).with((v) => {
                v.includeAll()
            })
            views.addSystemContextView('someName', { subject: sys1, description: 'someDescription', title: 'My Title' }).with((v) => {
                v.includeAll()
            })
            views.addContainerView('someName2s', { subject: sys1, description: 'someDescription' }).with((v) => {
                v.includeAll()
            })
            views.addComponentView('someName3', {
                subject: cont1,
                description: 'someOtherDescripgtion',
                title: 'The Other Title',
            }).with((v) => {
                v.includeAll()
            })

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should output archetypes block when archetypes are used',
        async () => {
            model = new Model('archModel')
            const springBoot = new ElementArchetype('springBootApp', ELEMENT_KINDS.container, {
                technology: 'Spring Boot',
                tags: ['Application'],
            })
            const microservice = new ElementArchetype(
                'microservice',
                ELEMENT_KINDS.container,
                {
                    tags: ['Microservice'],
                },
                springBoot
            )

            const sys = model.softwareSystem('mySystem')
            sys.container('Web App', springBoot)
            sys.container('API', microservice, { description: 'REST API' })

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should output relationship archetypes when used',
        async () => {
            model = new Model('relArchModel')
            const sync = new RelationshipArchetype('sync', { tags: ['Synchronous'] })
            const https = new RelationshipArchetype('https', { technology: 'HTTPS' }, sync)

            const person = model.person('user')
            const sys = model.softwareSystem('mySystem')
            person.uses(sys, https, { description: 'Makes API calls' })

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should use camelCase identifiers for multi-word group names',
        async () => {
            model = new Model('groupModel')
            const modelGroup = model.group('External Systems')
            modelGroup.softwareSystem('Email Service')

            const sys = model.softwareSystem('My System')
            const ssGroup = sys.group('Core Services')
            const container = ssGroup.container('API Server')

            const containerGroup = container.group('Domain Services')
            containerGroup.component('Auth Service')

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'should not output archetypes block when no archetypes are used',
        async () => {
            model = new Model('noArchModel')
            model.softwareSystem('sys1')

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'autoLayout - bare',
        async () => {
            views.addSystemLandscapeView('sl', { description: 'desc' }).with((v) => {
                v.autoLayout()
            })
            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'autoLayout - with direction',
        async () => {
            views.addSystemLandscapeView('sl', { description: 'desc' }).with((v) => {
                v.autoLayout('lr')
            })
            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'autoLayout - with direction and separations',
        async () => {
            views.addSystemLandscapeView('sl', { description: 'desc' }).with((v) => {
                v.autoLayout('tb', 300, 100)
            })
            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'default - marks view as default',
        async () => {
            views.addSystemLandscapeView('sl', { description: 'desc' }).with((v) => {
                v.setDefault()
            })
            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test('title - emits title in view block', () => {
        views.addSystemLandscapeView('sl', { description: 'desc', title: 'My Landscape' }).with((v) => {
            v.includeAll()
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('title - omitted when not set', () => {
        views.addSystemLandscapeView('sl', { description: 'desc' }).with((v) => {
            v.includeAll()
        })
        const dsl = writeDsl()
        expect(dsl).not.toContain('title')
        expect(dsl).toMatchSnapshot()
    })

    test(
        'per-view properties - emitted inside view block',
        async () => {
            views.addSystemLandscapeView('sl', { description: 'desc' }).with((v) => {
                v.addProperty('structurizr.sort', 'created')
                v.addProperty('custom.key', 'some value')
            })
            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'views-level properties - emitted inside views block',
        async () => {
            views.addProperty('structurizr.timezone', 'UTC')

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'styles - element style with multiple fields',
        async () => {
            views.addElementStyle('Database', {
                shape: 'Cylinder',
                background: '#336791',
                color: '#ffffff',
                fontSize: 14,
                border: 'solid',
            })

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'styles - relationship style',
        async () => {
            views.addRelationshipStyle('Synchronous', {
                thickness: 2,
                color: '#0000ff',
                style: 'solid',
                routing: 'Curved',
            })

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'themes - single theme uses "theme" keyword',
        async () => {
            views.addTheme('https://static.structurizr.com/themes/default/theme.json')

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'themes - multiple themes uses "themes" keyword',
        async () => {
            views.addTheme('default')
            views.addTheme('https://static.structurizr.com/themes/default/theme.json')

            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test(
        'includeElement accepts Person on container view',
        async () => {
            const person = model.person('alice')
            const sys = model.softwareSystem('MySystem')
            // Container view is scoped to SoftwareSystem — ViewBuilder.includeElement should accept Person (an Element)
            views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
                v.includeElement(person)
            })
            const dsl = writeDsl()
            expect(dsl).toMatchSnapshot()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    test('includeElements - single element', () => {
        const person = model.person('alice')
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeElements(person)
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('includeElements - array of elements', () => {
        const person1 = model.person('alice')
        const person2 = model.person('bob')
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeElements([person1, person2])
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('includeExpressions - single expression', () => {
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeExpressions('element.type==Person')
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('includeExpressions - array of expressions', () => {
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeExpressions(['element.type==Person', 'element.type==SoftwareSystem'])
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('excludeElements - single element', () => {
        const person = model.person('alice')
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeAll()
            v.excludeElements(person)
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('excludeElements - array of elements', () => {
        const person1 = model.person('alice')
        const person2 = model.person('bob')
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeAll()
            v.excludeElements([person1, person2])
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('excludeExpressions - single expression', () => {
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeAll()
            v.excludeExpressions('element.type==Person')
        })
        expect(writeDsl()).toMatchSnapshot()
    })

    test('excludeExpressions - array of expressions', () => {
        const sys = model.softwareSystem('MySystem')
        views.addContainerView('cv', { subject: sys, description: 'desc' }).with((v) => {
            v.includeAll()
            v.excludeExpressions(['element.type==Person', 'element.type==SoftwareSystem'])
        })
        expect(writeDsl()).toMatchSnapshot()
    })
})
