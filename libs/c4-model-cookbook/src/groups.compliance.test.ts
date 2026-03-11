// Reference: https://github.com/structurizr/structurizr.github.io/tree/main/dsl/cookbook/groups

import { Model, Views } from '@agilewallaby/c4-model'

import { complianceSuite } from './testUtils/complianceSuite'

complianceSuite('cookbook: groups (flat)', {
    buildModel() {
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
    },
    dslPath: 'groups/example-1.dsl',
})

complianceSuite('cookbook: groups - styling all groups', {
    buildModel() {
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
    },
    dslPath: 'groups/example-2.dsl',
})

complianceSuite('cookbook: groups - styling individual groups', {
    buildModel() {
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
    },
    dslPath: 'groups/example-3.dsl',
})

complianceSuite('cookbook: groups - nested groups', {
    buildModel() {
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
    },
    dslPath: 'groups/example-4.dsl',
})
