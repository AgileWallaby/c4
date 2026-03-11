// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/groups

import * as fs from 'fs'
import * as path from 'path'

import { Model, StructurizrDSLWriter, Views, exportWorkspaceJson, exportWorkspaceJsonFromDsl, validateModel } from '@agilewallaby/c4-model'

import { compareWorkspaceJsonSemantics } from './testUtils/compareWorkspaceJsonSemantics'

const TEST_TIMEOUT = 120_000

describe('cookbook: groups (flat)', () => {
    function buildModel() {
        const model = new Model('Groups')
        const company1 = model.group('Company 1')
        const a = company1.softwareSystem('A')
        const company2 = model.group('Company 2')
        const b = company2.softwareSystem('B')
        a.uses(b)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'An example of groups.' })
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
            const originalDsl = await fs.promises.readFile(path.join(import.meta.dirname, 'dsl/groups/example-1.dsl'), 'utf8')
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})

describe('cookbook: groups - styling all groups', () => {
    function buildModel() {
        const model = new Model('GroupStyles')
        const company1 = model.group('Company 1')
        const a = company1.softwareSystem('A')
        const company2 = model.group('Company 2')
        const b = company2.softwareSystem('B')
        a.uses(b)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Groups with styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Group', { color: '#ff0000' })
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
            const originalDsl = await fs.promises.readFile(path.join(import.meta.dirname, 'dsl/groups/example-2.dsl'), 'utf8')
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})

describe('cookbook: groups - styling individual groups', () => {
    function buildModel() {
        const model = new Model('IndividualGroupStyles')
        const company1 = model.group('Company 1')
        const a = company1.softwareSystem('A')
        const company2 = model.group('Company 2')
        const b = company2.softwareSystem('B')
        a.uses(b)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'Individual group styles.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Group:Company 1', { color: '#ff0000' })
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
            const originalDsl = await fs.promises.readFile(path.join(import.meta.dirname, 'dsl/groups/example-3.dsl'), 'utf8')
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})

describe('cookbook: groups - nested groups', () => {
    function buildModel() {
        const model = new Model('NestedGroups')
        const company1 = model.group('Company 1')
        const dept1 = company1.group('Department 1')
        const a = dept1.softwareSystem('A')
        const dept2 = company1.group('Department 2')
        const b = dept2.softwareSystem('B')
        a.uses(b)

        const views = new Views()
        const view = views.addSystemLandscapeView('Landscape', { description: 'An example of nested groups.' })
        view.includeAll()
        view.autoLayout('lr')
        views.addElementStyle('Group:Company 1/Department 1', { color: '#ff0000' })
        views.addElementStyle('Group:Company 1/Department 2', { color: '#0000ff' })
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
            const originalDsl = await fs.promises.readFile(path.join(import.meta.dirname, 'dsl/groups/example-4.dsl'), 'utf8')
            const [originalJson, generatedJson] = await Promise.all([
                exportWorkspaceJsonFromDsl(originalDsl),
                exportWorkspaceJson(model, views),
            ])
            compareWorkspaceJsonSemantics(originalJson, generatedJson)
        },
        TEST_TIMEOUT
    )
})
