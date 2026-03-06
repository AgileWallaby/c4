import { ElementArchetype, RelationshipArchetype } from '@agilewallaby/c4-model'

import type { WebPlatformCatalog } from './web-platform/c4.dsl'
import type { EmailServiceCatalog } from './email-service/c4.dsl'

export type ExampleSystemCatalog = {
    webPlatform: WebPlatformCatalog
    emailService: EmailServiceCatalog
}

export const nodeService = new ElementArchetype('nodeService', 'container', {
    technology: 'Node.js',
    tags: ['Service'],
})

export const httpsJson = new RelationshipArchetype('httpsJson', {
    technology: 'HTTPS/JSON',
    tags: ['Synchronous'],
})

export const amqp = new RelationshipArchetype('amqp', {
    technology: 'AMQP',
    tags: ['Asynchronous'],
})

export type ExampleArchetypes = {
    nodeService: ElementArchetype
    httpsJson: RelationshipArchetype
    amqp: RelationshipArchetype
}

export const exampleArchetypes: ExampleArchetypes = { nodeService, httpsJson, amqp }
