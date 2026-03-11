import * as fs from 'fs'
import * as path from 'path'

import { Model, StructurizrDSLWriter, Views, exportWorkspaceJson, exportWorkspaceJsonFromDsl, validateModel } from '@agilewallaby/c4-model'

import { compareWorkspaceJsonSemantics } from './compareWorkspaceJsonSemantics'

const TEST_TIMEOUT = 120_000

type ComplianceSuiteOptions =
    | { buildModel: () => { model: Model; views: Views }; dslPath: string }
    | { buildModel: () => { model: Model; views: Views }; validateOnly: true }
    | { buildModel: () => { model: Model; views: Views }; skipReason: string }

export function complianceSuite(suiteName: string, options: ComplianceSuiteOptions): void {
    describe(suiteName, () => {
        it('generates expected DSL', () => {
            const { model, views } = options.buildModel()
            const dsl = new StructurizrDSLWriter(model, views).write()
            expect(dsl).toMatchSnapshot()
        })

        if ('skipReason' in options) {
            it.todo(`validates with Structurizr (${options.skipReason})`)
            it.todo(`generated DSL is semantically equivalent to original cookbook DSL (${options.skipReason})`)
        } else if ('validateOnly' in options) {
            it(
                'validates with Structurizr',
                async () => {
                    const { model, views } = options.buildModel()
                    await validateModel(model, views)
                },
                TEST_TIMEOUT
            )
        } else {
            it(
                'validates with Structurizr',
                async () => {
                    const { model, views } = options.buildModel()
                    await validateModel(model, views)
                },
                TEST_TIMEOUT
            )

            it(
                'generated DSL is semantically equivalent to original cookbook DSL',
                async () => {
                    const { model, views } = options.buildModel()
                    const originalDsl = await fs.promises.readFile(
                        path.join(import.meta.dirname, '..', 'dsl', options.dslPath),
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
        }
    })
}
