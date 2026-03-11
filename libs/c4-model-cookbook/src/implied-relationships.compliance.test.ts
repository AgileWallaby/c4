// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/implied-relationships

import * as fs from 'fs'
import * as path from 'path'

import { Model, StructurizrDSLWriter, Views, exportWorkspaceJson, exportWorkspaceJsonFromDsl, validateModel } from '@agilewallaby/c4-model'

import { compareWorkspaceJsonSemantics } from './testUtils/compareWorkspaceJsonSemantics'

const TEST_TIMEOUT = 120_000

describe('cookbook: implied-relationships - default behavior', () => {
    // c4-model always generates implied relationships (Structurizr default behavior).
    // Relationship between person and container implies a person→softwareSystem relationship.
    function buildModel() {
        const model = new Model('ImpliedRelationships')
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        user.uses(webapp, { description: 'Uses' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', { subject: system, description: 'Implied relationships example.' })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    }

    it('generates expected DSL', () => {
        const { model, views } = buildModel()
        const dsl = new StructurizrDSLWriter(model, views).write()
        expect(dsl).toMatchSnapshot()
    })

    it(
        'validates with Structurizr',
        async () => {
            const { model, views } = buildModel()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    it(
        'generated DSL is semantically equivalent to original cookbook DSL',
        async () => {
            const { model, views } = buildModel()
            const originalDsl = await fs.promises.readFile(
                path.join(import.meta.dirname, 'dsl/implied-relationships/example-1.dsl'),
                'utf8'
            )
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})

describe('cookbook: implied-relationships - disabling implied relationships', () => {
    // example-2: !impliedRelationships false
    test.todo('!impliedRelationships false keyword is not yet supported by c4-model')
})

describe('cookbook: implied-relationships - multiple relationships merged', () => {
    // example-3: two container-level relationships imply one merged system-level relationship
    function buildModel() {
        const model = new Model()
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        user.uses(webapp, { description: 'Uses 1' })
        user.uses(webapp, { description: 'Uses 2' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', { subject: system })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    }

    it('generates expected DSL', () => {
        const { model, views } = buildModel()
        const dsl = new StructurizrDSLWriter(model, views).write()
        expect(dsl).toMatchSnapshot()
    })

    it(
        'validates with Structurizr',
        async () => {
            const { model, views } = buildModel()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    it(
        'generated DSL is semantically equivalent to original cookbook DSL',
        async () => {
            const { model, views } = buildModel()
            const originalDsl = await fs.promises.readFile(
                path.join(import.meta.dirname, 'dsl/implied-relationships/example-3.dsl'),
                'utf8'
            )
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})

describe('cookbook: implied-relationships - explicit at both levels', () => {
    // example-4: relationships defined at both system and container level
    function buildModel() {
        const model = new Model()
        const user = model.person('User')
        const system = model.softwareSystem('Software System')
        const webapp = system.container('Web Application')
        user.uses(system, { description: 'Uses 1' })
        user.uses(system, { description: 'Uses 2' })
        user.uses(webapp, { description: 'Uses 1' })
        user.uses(webapp, { description: 'Uses 2' })

        const views = new Views()
        const view = views.addSystemContextView('SystemContext', { subject: system })
        view.includeAll()
        view.autoLayout('lr')
        return { model, views }
    }

    it('generates expected DSL', () => {
        const { model, views } = buildModel()
        const dsl = new StructurizrDSLWriter(model, views).write()
        expect(dsl).toMatchSnapshot()
    })

    it(
        'validates with Structurizr',
        async () => {
            const { model, views } = buildModel()
            await validateModel(model, views)
        },
        TEST_TIMEOUT
    )

    it(
        'generated DSL is semantically equivalent to original cookbook DSL',
        async () => {
            const { model, views } = buildModel()
            const originalDsl = await fs.promises.readFile(
                path.join(import.meta.dirname, 'dsl/implied-relationships/example-4.dsl'),
                'utf8'
            )
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})
