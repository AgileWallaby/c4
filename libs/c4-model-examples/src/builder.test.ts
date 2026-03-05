import { buildModel, StructurizrDSLWriter, Views } from '@agilewallaby/c4-model'

describe('build model', () => {
    test('can build model', async () => {
        const model = await buildModel({ searchRoot: __dirname })
        const writer = new StructurizrDSLWriter(model, new Views())
        const dsl = writer.write()
        expect(dsl).toMatchSnapshot()
    })
})
