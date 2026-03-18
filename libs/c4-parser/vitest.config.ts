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
        coverage: { reportsDirectory: '../../coverage/libs/c4-parser', provider: 'v8' },
    },
})
