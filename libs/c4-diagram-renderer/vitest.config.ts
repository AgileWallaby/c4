import { defineConfig } from 'vitest/config'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const workspaceRoot = resolve(__dirname, '../..')

export default defineConfig({
    resolve: {
        alias: {
            '@c4/c4-parser': resolve(workspaceRoot, 'libs/c4-parser/src/index.ts'),
            '@c4/c4-diagram-renderer': resolve(workspaceRoot, 'libs/c4-diagram-renderer/src/index.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'node',
        root: __dirname,
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        testTimeout: 30000,
        coverage: { reportsDirectory: '../../coverage/libs/c4-diagram-renderer', provider: 'v8' },
    },
})
