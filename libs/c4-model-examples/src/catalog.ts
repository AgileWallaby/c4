import type { WebPlatformCatalog } from './web-platform/c4.dsl'
import type { EmailServiceCatalog } from './email-service/c4.dsl'

export type ExampleSystemCatalog = {
    webPlatform: WebPlatformCatalog
    emailService: EmailServiceCatalog
}
