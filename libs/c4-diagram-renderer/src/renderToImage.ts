import { chromium } from 'playwright'
import type { WorkspaceJson } from '@c4/c4-parser'
import { parseView } from '@c4/c4-parser'
import type { Node, Edge } from '@xyflow/react'
import { prepareNodesForSsr } from './prepareNodes'
import { renderToHtml } from './renderToHtml'

export interface RenderOptions {
    /** Width of the output image in pixels. Default: 1200 */
    width?: number
    /** Height of the output image in pixels. Default: 800 */
    height?: number
    /** Background color. Default: '#ffffff' */
    background?: string
    /** Device scale factor for higher resolution output. Default: 2 */
    deviceScaleFactor?: number
}

/**
 * Captures a screenshot of the given HTML string using Playwright.
 */
async function captureScreenshot(
    html: string,
    options: { width: number; height: number; deviceScaleFactor: number },
): Promise<Buffer> {
    const browser = await chromium.launch()
    try {
        const page = await browser.newPage({
            viewport: { width: options.width, height: options.height },
            deviceScaleFactor: options.deviceScaleFactor,
        })
        await page.setContent(html, { waitUntil: 'networkidle' })
        const screenshot = await page.screenshot({ type: 'png' })
        return Buffer.from(screenshot)
    } finally {
        await browser.close()
    }
}

/**
 * Renders a C4 diagram view to a PNG image buffer.
 *
 * Takes a Structurizr workspace JSON and a view key, renders the diagram
 * using React Flow's SSR support, then captures a screenshot with Playwright.
 */
export async function renderToImage(
    workspace: WorkspaceJson,
    viewKey: string,
    options: RenderOptions = {},
): Promise<Buffer> {
    const { width = 1200, height = 800, background = '#ffffff', deviceScaleFactor = 2 } = options

    // Parse the view into React Flow nodes and edges
    const { nodes: rawNodes, edges } = parseView(workspace, viewKey)
    if (rawNodes.length === 0) {
        throw new Error(`View "${viewKey}" not found or contains no elements.`)
    }

    // Add SSR-required properties (width, height, handles)
    const nodes = prepareNodesForSsr(rawNodes)

    // Render to a self-contained HTML document
    const html = renderToHtml(nodes, edges, { width, height, background })

    return captureScreenshot(html, { width, height, deviceScaleFactor })
}

/**
 * Renders pre-positioned nodes and edges to a PNG image buffer.
 *
 * Accepts nodes that already have their final positions (e.g. from the viewer's
 * current layout) and renders them directly, bypassing workspace parsing.
 */
export async function renderNodesToImage(
    nodes: Node[],
    edges: Edge[],
    options: RenderOptions = {},
): Promise<Buffer> {
    const { width = 1200, height = 800, background = '#ffffff', deviceScaleFactor = 2 } = options

    if (nodes.length === 0) {
        throw new Error('No nodes provided for rendering.')
    }

    // Add SSR-required properties (width, height, handles)
    const ssrNodes = prepareNodesForSsr(nodes)

    // Render to a self-contained HTML document
    const html = renderToHtml(ssrNodes, edges, { width, height, background })

    return captureScreenshot(html, { width, height, deviceScaleFactor })
}
