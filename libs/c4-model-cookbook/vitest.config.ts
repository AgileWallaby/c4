import { defineConfig } from 'vitest/config'
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.ts'],
        testTimeout: 120000,
        coverage: { reportsDirectory: '../../coverage/libs/c4-model-cookbook', provider: 'v8' },
    },
})
