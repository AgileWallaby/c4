import { buildModel } from '@agilewallaby/c4-model'

describe('build model', () => {
    test('can build model', async () => {
        await buildModel({ searchRoot: __dirname })
    })
})
