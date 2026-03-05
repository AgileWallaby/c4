import { C4Module, Component, Container, Model, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog } from '../catalog'
import { nodeService, amqp } from '../archetypes'

export type EmailServiceCatalog = {
    emailService: SoftwareSystem
    emailApi: Container
    emailWorker: Container
    messageQueue: Container
    templateEngine: Component
    deliveryTracker: Component
}

export const c4Module: C4Module<ExampleSystemCatalog, EmailServiceCatalog> = {
    key: 'emailService',
    registerDefinitions(model: Model): EmailServiceCatalog {
        const emailService = model.defineSoftwareSystem('Email Service', {
            description: 'Handles sending and tracking email notifications',
        })
        const emailApi = emailService.defineContainer('Email API', nodeService, {
            description: 'Accepts email send requests',
        })
        const messageQueue = emailService.defineContainer('Message Queue', {
            description: 'Queues outbound email jobs',
            technology: 'RabbitMQ',
        })
        const emailWorker = emailService.defineContainer('Email Worker', nodeService, {
            description: 'Processes queued emails and delivers them',
        })
        const templateEngine = emailWorker.defineComponent('Template Engine', {
            description: 'Renders email templates with dynamic content',
            technology: 'Handlebars',
        })
        const deliveryTracker = emailWorker.defineComponent('Delivery Tracker', {
            description: 'Tracks delivery status and handles retries',
            technology: 'TypeScript',
        })

        return { emailService, emailApi, emailWorker, messageQueue, templateEngine, deliveryTracker }
    },
    buildRelationships(local, _dependencies): void {
        local.emailApi.uses(local.messageQueue, amqp, { description: 'Enqueues email jobs to' })
        local.emailWorker.uses(local.messageQueue, amqp, { description: 'Consumes email jobs from' })
        local.templateEngine.uses(local.deliveryTracker, { description: 'Passes rendered emails to' })
    },
}
