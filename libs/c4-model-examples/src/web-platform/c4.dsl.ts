import { C4Module, Container, Model, Person, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog, ExampleArchetypes } from '../catalog'

export type WebPlatformCatalog = {
    customer: Person
    webPlatform: SoftwareSystem
    webApp: Container
    apiServer: Container
    database: Container
}

export const c4Module: C4Module<ExampleSystemCatalog, WebPlatformCatalog, ExampleArchetypes> = {
    key: 'webPlatform',
    registerDefinitions(model: Model, archetypes: ExampleArchetypes): WebPlatformCatalog {
        const customer = model.person('Customer', { description: 'A user of the web platform' })

        const webPlatform = model.softwareSystem('Web Platform', {
            description: 'Allows customers to manage their account and send notifications',
        })
        const webApp = webPlatform.container('Web App', {
            description: 'Serves the single-page application',
            technology: 'React',
        })
        const apiServer = webPlatform.container('API Server', archetypes.nodeService, {
            description: 'Provides the REST API',
        })
        const database = webPlatform.container('Database', {
            description: 'Stores user data and notification history',
            technology: 'PostgreSQL',
        })

        return { customer, webPlatform, webApp, apiServer, database }
    },
    buildRelationships(local, dependencies, archetypes): void {
        local.customer.uses(local.webApp, { description: 'Manages account and sends notifications using' })
        local.webApp.uses(local.apiServer, archetypes.httpsJson, { description: 'Makes API calls to' })
        local.apiServer.uses(local.database, { description: 'Reads from and writes to', technology: 'SQL' })
        local.apiServer.uses(dependencies.emailService.emailApi, archetypes.httpsJson, { description: 'Sends emails via' })
    },
}
