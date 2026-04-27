import { Model } from './model'
import { View, Views } from './views'

describe('View', () => {
    let model: Model
    let views: Views
    let view: View<ReturnType<Model['softwareSystem']>>

    beforeEach(() => {
        model = new Model('m')
        views = new Views()
        view = views.addContainerView('cv', { subject: model.softwareSystem('MySystem'), description: 'desc' })
    })

    describe('includeElements', () => {
        test('single element produces one include scope', () => {
            const person = model.person('alice')
            view.includeElements(person)
            expect(view.scopes).toEqual(['include alice'])
        })

        test('array of elements produces one include scope per element', () => {
            const alice = model.person('alice')
            const bob = model.person('bob')
            view.includeElements([alice, bob])
            expect(view.scopes).toEqual(['include alice', 'include bob'])
        })

        test('single-element array behaves the same as passing element directly', () => {
            const person = model.person('charlie')
            view.includeElements(person)
            const scopes1 = [...view.scopes]

            const view2 = views.addContainerView('cv2', {
                subject: model.softwareSystem('Other'),
                description: 'desc',
            })
            view2.includeElements([model.person('charlie2')])
            // Both produce exactly one scope entry
            expect(scopes1).toHaveLength(1)
            expect(view2.scopes).toHaveLength(1)
        })
    })

    describe('includeExpressions', () => {
        test('single expression produces one include scope', () => {
            view.includeExpressions('element.type==Person')
            expect(view.scopes).toEqual(['include element.type==Person'])
        })

        test('array of expressions produces one include scope per expression', () => {
            view.includeExpressions(['element.type==Person', 'element.type==SoftwareSystem'])
            expect(view.scopes).toEqual([
                'include element.type==Person',
                'include element.type==SoftwareSystem',
            ])
        })
    })

    describe('excludeElements', () => {
        test('single element produces one exclude scope', () => {
            const person = model.person('alice')
            view.excludeElements(person)
            expect(view.scopes).toEqual(['exclude alice'])
        })

        test('array of elements produces one exclude scope per element', () => {
            const alice = model.person('alice')
            const bob = model.person('bob')
            view.excludeElements([alice, bob])
            expect(view.scopes).toEqual(['exclude alice', 'exclude bob'])
        })
    })

    describe('excludeExpressions', () => {
        test('single expression produces one exclude scope', () => {
            view.excludeExpressions('element.type==Person')
            expect(view.scopes).toEqual(['exclude element.type==Person'])
        })

        test('array of expressions produces one exclude scope per expression', () => {
            view.excludeExpressions(['element.type==Person', 'element.type==SoftwareSystem'])
            expect(view.scopes).toEqual([
                'exclude element.type==Person',
                'exclude element.type==SoftwareSystem',
            ])
        })
    })

    test('plural methods append scopes in order alongside singular methods', () => {
        const alice = model.person('alice')
        const bob = model.person('bob')
        view.includeAll()
        view.excludeElements([alice, bob])
        view.excludeExpressions('element.type==Person')
        expect(view.scopes).toEqual([
            'include *',
            'exclude alice',
            'exclude bob',
            'exclude element.type==Person',
        ])
    })
})
