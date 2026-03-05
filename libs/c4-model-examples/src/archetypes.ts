import { ElementArchetype, RelationshipArchetype } from '@agilewallaby/c4-model'

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
