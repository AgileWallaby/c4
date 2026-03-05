import { defineConfig } from 'vitest/config'
export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.{test,spec}.ts'],
        coverage: { reportsDirectory: '../../coverage/libs/c4-model', provider: 'v8' },
    },
})
