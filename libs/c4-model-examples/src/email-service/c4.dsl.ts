import { C4Module, Component, Container, Model, SoftwareSystem } from '@agilewallaby/c4-model'
import type { ExampleSystemCatalog } from '../catalog'

export function buildModel(model: Model) {
    model.referencePerson('person1')
    model.defineSoftwareSystem('softwareSystem1')
}

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
        const emailApi = emailService.defineContainer('Email API', {
            description: 'Accepts email send requests',
            technology: 'Node.js',
        })
        const messageQueue = emailService.defineContainer('Message Queue', {
            description: 'Queues outbound email jobs',
            technology: 'RabbitMQ',
        })
        const emailWorker = emailService.defineContainer('Email Worker', {
            description: 'Processes queued emails and delivers them',
            technology: 'Node.js',
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
        local.emailApi.uses(local.messageQueue, { description: 'Enqueues email jobs to', technology: 'AMQP' })
        local.emailWorker.uses(local.messageQueue, { description: 'Consumes email jobs from', technology: 'AMQP' })
        local.templateEngine.uses(local.deliveryTracker, { description: 'Passes rendered emails to' })
    },
}
