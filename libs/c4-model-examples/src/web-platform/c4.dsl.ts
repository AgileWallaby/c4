import { C4Module, Component, Container, Model, Person, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog, ExampleArchetypes } from '../catalog'

export type WebPlatformCatalog = {
    customer: Person
    webPlatform: SoftwareSystem & {
        webApp: Container
        apiServer: Container & {
            notificationService: Component
        }
        database: Container
    }
}

export const c4Module: C4Module<ExampleSystemCatalog, WebPlatformCatalog, ExampleArchetypes> = {
    key: 'webPlatform',
    registerDefinitions(model: Model, archetypes: ExampleArchetypes): WebPlatformCatalog {
        const customer = model.person('Customer', { description: 'A user of the web platform' })

        const webPlatform = model
            .softwareSystem('Web Platform', {
                description: 'Allows customers to manage their account and send notifications',
            })
            .with((ss) => ({
                webApp: ss.container('Web App', {
                    description: 'Serves the single-page application',
                    technology: 'React',
                }),
                apiServer: ss
                    .container('API Server', archetypes.nodeService, {
                        description: 'Provides the REST API',
                    })
                    .with((c) => ({
                        notificationService: c.component('Notification Service', {
                            description: 'Handles notification logic and integrates with third-party services',
                            technology: 'Node.js',
                        }),
                    })),
                database: ss.container('Database', {
                    description: 'Stores user data and notification history',
                    technology: 'PostgreSQL',
                }),
            }))

        return { customer, webPlatform }
    },
    buildRelationships(local, dependencies, archetypes): void {
        const { webApp, apiServer, database } = local.webPlatform
        local.customer.uses(webApp, { description: 'Manages account and sends notifications using' })
        webApp.uses(apiServer, archetypes.httpsJson, { description: 'Makes API calls to' })
        apiServer.uses(database, { description: 'Reads from and writes to', technology: 'SQL' })
        apiServer.uses(dependencies.emailService.emailApi, archetypes.httpsJson, { description: 'Sends emails via' })
    },
}
