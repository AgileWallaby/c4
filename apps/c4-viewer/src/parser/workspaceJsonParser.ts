import type { Node, Edge } from '@xyflow/react'
import type { WorkspaceJson, StructurizrView, ResolvedElement, ElementType, Relationship } from './types'
import { computeLayout } from './layoutEngine'

export function getAllViews(workspace: WorkspaceJson): StructurizrView[] {
    const { views } = workspace
    return [...(views.systemLandscapeViews ?? []), ...(views.systemContextViews ?? []), ...(views.containerViews ?? [])]
}

function buildElementMap(workspace: WorkspaceJson): Map<string, ResolvedElement> {
    const map = new Map<string, ResolvedElement>()
    const { model } = workspace

    // Track which group each element belongs to (by element id → group id)
    const groupMembership = new Map<string, string>()

    for (const group of model.groups ?? []) {
        const groupId = group.id ?? group.name
        for (const person of group.people ?? []) {
            groupMembership.set(person.id, groupId)
        }
        for (const system of group.softwareSystems ?? []) {
            groupMembership.set(system.id, groupId)
        }
    }

    for (const person of model.people ?? []) {
        map.set(person.id, {
            id: person.id,
            name: person.name,
            description: person.description,
            tags: person.tags,
            type: 'Person' as ElementType,
            isExternal: hasTag(person.tags, 'External'),
            groupId: groupMembership.get(person.id),
        })
    }

    for (const system of model.softwareSystems ?? []) {
        map.set(system.id, {
            id: system.id,
            name: system.name,
            description: system.description,
            tags: system.tags,
            type: 'SoftwareSystem' as ElementType,
            isExternal: hasTag(system.tags, 'External'),
            groupId: groupMembership.get(system.id),
        })

        for (const container of system.containers ?? []) {
            map.set(container.id, {
                id: container.id,
                name: container.name,
                description: container.description,
                technology: container.technology,
                tags: container.tags,
                type: 'Container' as ElementType,
                isExternal: hasTag(container.tags, 'External'),
                parentSystemId: system.id,
            })
        }
    }

    return map
}

function buildRelationshipMap(workspace: WorkspaceJson): Map<string, Relationship> {
    const map = new Map<string, Relationship>()
    const { model } = workspace

    for (const rel of model.relationships ?? []) {
        map.set(rel.id, rel)
    }
    for (const person of model.people ?? []) {
        for (const rel of person.relationships ?? []) {
            map.set(rel.id, rel)
        }
    }
    for (const system of model.softwareSystems ?? []) {
        for (const rel of system.relationships ?? []) {
            map.set(rel.id, rel)
        }
        for (const container of system.containers ?? []) {
            for (const rel of container.relationships ?? []) {
                map.set(rel.id, rel)
            }
        }
    }

    return map
}

function hasTag(tags: string | undefined, tag: string): boolean {
    if (!tags) return false
    return tags
        .split(',')
        .map((t) => t.trim())
        .includes(tag)
}

const typeToNodeType: Record<ElementType, string> = {
    Person: 'personNode',
    SoftwareSystem: 'softwareSystemNode',
    Container: 'containerNode',
    Group: 'groupNode',
}

export function parseView(workspace: WorkspaceJson, viewKey: string): { nodes: Node[]; edges: Edge[] } {
    const elementMap = buildElementMap(workspace)
    const relationshipMap = buildRelationshipMap(workspace)

    const view = getAllViews(workspace).find((v) => v.key === viewKey)
    if (!view) return { nodes: [], edges: [] }

    const viewElements = view.elements ?? []
    const viewRelationships = view.relationships ?? []

    // Determine which group IDs are needed by elements in this view
    const groupIds = new Set<string>()
    for (const ve of viewElements) {
        const el = elementMap.get(ve.id)
        if (el?.groupId) groupIds.add(el.groupId)
    }

    // Build group parent nodes
    const groupNodeMap = new Map<string, Node>()
    for (const groupId of groupIds) {
        // Find the group's name from the model
        const group = workspace.model.groups?.find((g) => (g.id ?? g.name) === groupId)
        const groupNode: Node = {
            id: `group-${groupId}`,
            type: 'groupNode',
            position: { x: 0, y: 0 },
            data: { label: group?.name ?? groupId },
            style: { width: 200, height: 200 },
        }
        groupNodeMap.set(groupId, groupNode)
    }

    // Build element nodes, tracking which have embedded positions
    const elementNodes: Node[] = []
    let hasEmbeddedPositions = false

    for (const ve of viewElements) {
        const el = elementMap.get(ve.id)
        if (!el) continue

        const hasPosition = (ve.x !== undefined && ve.x !== 0) || (ve.y !== undefined && ve.y !== 0)
        if (hasPosition) hasEmbeddedPositions = true

        const node: Node = {
            id: el.id,
            type: typeToNodeType[el.type],
            position: { x: ve.x ?? 0, y: ve.y ?? 0 },
            data: {
                label: el.name,
                elementType: el.type,
                description: el.description,
                technology: el.technology,
                isExternal: el.isExternal,
            },
        }

        if (el.groupId && groupNodeMap.has(el.groupId)) {
            node.parentId = `group-${el.groupId}`
            node.extent = 'parent'
        }

        elementNodes.push(node)
    }

    // Build edges
    const edges: Edge[] = viewRelationships
        .map((vr) => {
            const rel = relationshipMap.get(vr.id)
            if (!rel) return null
            return {
                id: vr.id,
                source: rel.sourceId,
                target: rel.destinationId,
                type: 'relationshipEdge',
                data: {
                    description: rel.description,
                    technology: rel.technology,
                },
            } satisfies Edge
        })
        .filter((e): e is Edge => e !== null)

    const groupNodes = [...groupNodeMap.values()]
    const allNodes = [...groupNodes, ...elementNodes]

    if (hasEmbeddedPositions) {
        return { nodes: allNodes, edges }
    }

    const layoutNodes = computeLayout(allNodes, edges, view.autoLayout)
    return { nodes: layoutNodes, edges }
}
