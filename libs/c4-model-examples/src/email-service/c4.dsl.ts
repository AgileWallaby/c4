import { C4Module, Component, Container, Model, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog, ExampleArchetypes } from '../catalog'

export type EmailServiceCatalog = {
    emailService: SoftwareSystem
    emailApi: Container
    emailWorker: Container
    messageQueue: Container
    templateEngine: Component
    deliveryTracker: Component
}

export const c4Module: C4Module<ExampleSystemCatalog, EmailServiceCatalog, ExampleArchetypes> = {
    key: 'emailService',
    registerDefinitions(model: Model, archetypes: ExampleArchetypes): EmailServiceCatalog {
        const emailService = model.softwareSystem('Email Service', {
            description: 'Handles sending and tracking email notifications',
        })
        const emailApi = emailService.container('Email API', archetypes.nodeService, {
            description: 'Accepts email send requests',
        })
        const messageQueue = emailService.container('Message Queue', {
            description: 'Queues outbound email jobs',
            technology: 'RabbitMQ',
        })
        const emailWorker = emailService.container('Email Worker', archetypes.nodeService, {
            description: 'Processes queued emails and delivers them',
        })
        const templateEngine = emailWorker.component('Template Engine', {
            description: 'Renders email templates with dynamic content',
            technology: 'Handlebars',
        })
        const deliveryTracker = emailWorker.component('Delivery Tracker', {
            description: 'Tracks delivery status and handles retries',
            technology: 'TypeScript',
        })

        return { emailService, emailApi, emailWorker, messageQueue, templateEngine, deliveryTracker }
    },
    addRelationships(local, _dependencies, archetypes): void {
        local.emailApi.uses(local.messageQueue, archetypes.amqp, { description: 'Enqueues email jobs to' })
        local.emailWorker.uses(local.messageQueue, archetypes.amqp, { description: 'Consumes email jobs from' })
        local.templateEngine.uses(local.deliveryTracker, { description: 'Passes rendered emails to' })
    },
}
