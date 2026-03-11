// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/container-view-multiple-software-systems

import * as fs from 'fs'
import * as path from 'path'

import { Model, StructurizrDSLWriter, Views, exportWorkspaceJson, exportWorkspaceJsonFromDsl, validateModel } from '@agilewallaby/c4-model'

import { compareWorkspaceJsonSemantics } from './testUtils/compareWorkspaceJsonSemantics'

const TEST_TIMEOUT = 120_000

describe('cookbook: container-view-multiple-software-systems - include all', () => {
    // example-1: container view with include * — only containers of the subject system are included
    function buildModel() {
        const model = new Model()
        const s1 = model.softwareSystem('Software System 1')
        const c1 = s1.container('Container 1')
        const s2 = model.softwareSystem('Software System 2')
        const c2 = s2.container('Container 2')
        c1.uses(c2)

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: s1 })
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
                path.join(import.meta.dirname, 'dsl/container-view-multiple-software-systems/example-1.dsl'),
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

describe('cookbook: container-view-multiple-software-systems - explicit include', () => {
    // example-2: container view with explicit include of containers from both systems
    function buildModel() {
        const model = new Model()
        const s1 = model.softwareSystem('Software System 1')
        const c1 = s1.container('Container 1')
        const s2 = model.softwareSystem('Software System 2')
        const c2 = s2.container('Container 2')
        c1.uses(c2)

        const views = new Views()
        const view = views.addContainerView('Containers', { subject: s1 })
        view.includeElement(c1)
        view.includeElement(c2)
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
                path.join(import.meta.dirname, 'dsl/container-view-multiple-software-systems/example-2.dsl'),
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
