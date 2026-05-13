import { defineConfig } from 'vitest/config'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        root: __dirname,
        include: ['src/**/*.{test,spec}.ts'],
        passWithNoTests: true,
        coverage: { reportsDirectory: '../../coverage/apps/c4-viewer-api', provider: 'v8' },
    },
})
