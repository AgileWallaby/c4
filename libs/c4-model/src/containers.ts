import { GenericContainer, Wait } from 'testcontainers'

const STRUCTURIZR_IMAGE = 'structurizr/structurizr:2026.05.16'
const MERMAID_CLI_IMAGE = 'minlag/mermaid-cli:11.15.0'

export function createStructurizrContainer(tmpDir: string, logs: string[]): GenericContainer {
    return new GenericContainer(STRUCTURIZR_IMAGE)
        .withBindMounts([{ source: tmpDir, target: '/workspace', mode: 'rw' }])
        .withWaitStrategy(Wait.forOneShotStartup())
        .withLogConsumer((stream) => stream.on('data', (chunk) => logs.push(chunk.toString())))
}

export function createMermaidContainer(tmpDir: string): GenericContainer {
    return new GenericContainer(MERMAID_CLI_IMAGE)
        .withBindMounts([{ source: tmpDir, target: '/data', mode: 'rw' }])
        .withWaitStrategy(Wait.forOneShotStartup())
}
