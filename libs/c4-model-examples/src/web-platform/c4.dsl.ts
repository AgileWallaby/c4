import { C4Module, Container, Model, Person, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog } from '../catalog'

export function buildModel(model: Model) {
    model.definePerson('person1')
    model.referenceSoftwareSystem('softwareSystem1')
}

export type WebPlatformCatalog = {
    customer: Person
    webPlatform: SoftwareSystem
    webApp: Container
    apiServer: Container
    database: Container
}

export const c4Module: C4Module<ExampleSystemCatalog, WebPlatformCatalog> = {
    key: 'webPlatform',
    registerDefinitions(model: Model): WebPlatformCatalog {
        const customer = model.definePerson('Customer', { description: 'A user of the web platform' })

        const webPlatform = model.defineSoftwareSystem('Web Platform', {
            description: 'Allows customers to manage their account and send notifications',
        })
        const webApp = webPlatform.defineContainer('Web App', {
            description: 'Serves the single-page application',
            technology: 'React',
        })
        const apiServer = webPlatform.defineContainer('API Server', {
            description: 'Provides the REST API',
            technology: 'Node.js',
        })
        const database = webPlatform.defineContainer('Database', {
            description: 'Stores user data and notification history',
            technology: 'PostgreSQL',
        })

        return { customer, webPlatform, webApp, apiServer, database }
    },
    buildRelationships(local, dependencies): void {
        local.customer.uses(local.webApp, { description: 'Manages account and sends notifications using' })
        local.webApp.uses(local.apiServer, { description: 'Makes API calls to', technology: 'HTTPS/JSON' })
        local.apiServer.uses(local.database, { description: 'Reads from and writes to', technology: 'SQL' })
        local.apiServer.uses(dependencies.emailService.emailApi, { description: 'Sends emails via', technology: 'HTTPS/JSON' })
    },
}
