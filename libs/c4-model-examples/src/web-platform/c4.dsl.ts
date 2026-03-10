import { C4Module, Component, Container, Model, Person, SoftwareSystem, Views } from '@agilewallaby/c4-model'
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
        const { customer } = model.group('External Users').with((g) => ({
            customer: g.person('Customer', { description: 'A user of the web platform' }),
        }))

        const webPlatform = model
            .softwareSystem('Web Platform', {
                description: 'Allows customers to manage their account and send notifications',
            })
            .with((ss) => {
                const { webApp, apiServer } = ss.group('Application Tier').with((g) => ({
                    webApp: g.container('Web App', {
                        description: 'Serves the single-page application',
                        technology: 'React',
                    }),
                    apiServer: g
                        .container('API Server', archetypes.nodeService, {
                            description: 'Provides the REST API',
                        })
                        .with((c) => {
                            const { notificationService } = c.group('Integrations').with((ig) => ({
                                notificationService: ig.component('Notification Service', {
                                    description: 'Handles notification logic and integrates with third-party services',
                                    technology: 'Node.js',
                                }),
                            }))
                            return { notificationService }
                        }),
                }))
                return {
                    webApp,
                    apiServer,
                    database: ss.container('Database', {
                        description: 'Stores user data and notification history',
                        technology: 'PostgreSQL',
                    }),
                }
            })

        return { customer, webPlatform }
    },
    addViews(views: Views, local: WebPlatformCatalog): void {
        views.addSystemLandscapeView('landscape', { description: 'System Landscape' }).includeAll()
        views.addContainerView('webPlatform', { subject: local.webPlatform, description: 'Web Platform' }).includeAll()
    },
    addRelationships(local, dependencies, archetypes): void {
        const { webApp, apiServer, database } = local.webPlatform
        local.customer.uses(webApp, { description: 'Manages account and sends notifications using' })
        webApp.uses(apiServer, archetypes.httpsJson, { description: 'Makes API calls to' })
        apiServer.uses(database, { description: 'Reads from and writes to', technology: 'SQL' })
        apiServer.uses(dependencies.emailService.emailApi, archetypes.httpsJson, { description: 'Sends emails via' })
    },
}
