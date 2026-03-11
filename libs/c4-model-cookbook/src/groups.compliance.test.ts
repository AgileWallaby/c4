// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/groups

import { Model, StructurizrDSLWriter, Views, validateModel } from '@agilewallaby/c4-model'

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
})

describe('cookbook: groups - nested groups', () => {
    test.todo('nested groups require structurizr.groupSeparator model property — not yet supported by c4-model')
})
