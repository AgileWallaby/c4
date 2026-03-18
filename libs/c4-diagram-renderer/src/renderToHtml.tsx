import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ReactFlow } from '@xyflow/react'
import type { Node, Edge } from '@xyflow/react'
import { SsrPersonNode, SsrSoftwareSystemNode, SsrContainerNode, SsrGroupNode } from './ssrNodes'
import { SsrRelationshipEdge } from './ssrEdges'
import { readReactFlowCss } from './readCss'

const nodeTypes = {
    personNode: SsrPersonNode,
    softwareSystemNode: SsrSoftwareSystemNode,
    containerNode: SsrContainerNode,
    groupNode: SsrGroupNode,
}

const edgeTypes = {
    relationshipEdge: SsrRelationshipEdge,
}

export interface RenderToHtmlOptions {
    width?: number
    height?: number
    background?: string
}

/**
 * Renders a React Flow diagram to a self-contained HTML document string
 * suitable for screenshot capture. Nodes must be pre-processed with
 * prepareNodesForSsr() to include explicit dimensions and handle positions.
 */
export function renderToHtml(
    nodes: Node[],
    edges: Edge[],
    options: RenderToHtmlOptions = {},
): string {
    const { width = 1200, height = 800, background = '#ffffff' } = options

    const flowMarkup = renderToStaticMarkup(
        React.createElement(
            ReactFlow,
            {
                nodes,
                edges,
                nodeTypes,
                edgeTypes,
                fitView: true,
                width,
                height,
                minZoom: 0.1,
                maxZoom: 2,
            },
        ),
    )

    const reactFlowCss = readReactFlowCss()

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
${reactFlowCss}

html, body {
    margin: 0;
    padding: 0;
    width: ${width}px;
    height: ${height}px;
    overflow: hidden;
    background: ${background};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
</head>
<body>
${flowMarkup}
</body>
</html>`
}
