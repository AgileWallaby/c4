import { expect } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObject = Record<string, any>

interface ElementEntry {
    id: string
    name: string
    type: string
    parentName?: string
}

interface RelationshipEntry {
    id: string
    sourceId: string
    destinationId: string
    description: string
}

/**
 * Collects all model elements (people, softwareSystems, containers, components)
 * from the workspace JSON into a flat list.
 */
function collectElements(workspace: AnyObject): ElementEntry[] {
    const elements: ElementEntry[] = []
    const model = workspace.model ?? {}

    const collectPerson = (p: AnyObject) => elements.push({ id: p.id, name: p.name, type: 'person' })

    const collectSoftwareSystem = (ss: AnyObject) => {
        elements.push({ id: ss.id, name: ss.name, type: 'softwareSystem' })
        for (const c of ss.containers ?? []) {
            elements.push({ id: c.id, name: c.name, type: 'container', parentName: ss.name })
            for (const comp of c.components ?? []) {
                elements.push({
                    id: comp.id,
                    name: comp.name,
                    type: 'component',
                    parentName: `${ss.name}/${c.name}`,
                })
            }
        }
    }

    for (const p of model.people ?? []) collectPerson(p)
    for (const ss of model.softwareSystems ?? []) collectSoftwareSystem(ss)

    return elements
}

function collectRelationships(workspace: AnyObject): RelationshipEntry[] {
    const relationships: RelationshipEntry[] = []
    const model = workspace.model ?? {}

    const addRels = (rels: AnyObject[]) => {
        for (const r of rels ?? []) {
            relationships.push({
                id: r.id,
                sourceId: r.sourceId,
                destinationId: r.destinationId,
                description: r.description ?? '',
            })
        }
    }

    addRels(model.relationships ?? [])
    for (const p of model.people ?? []) addRels(p.relationships ?? [])
    for (const ss of model.softwareSystems ?? []) {
        addRels(ss.relationships ?? [])
        for (const c of ss.containers ?? []) {
            addRels(c.relationships ?? [])
            for (const comp of c.components ?? []) {
                addRels(comp.relationships ?? [])
            }
        }
    }

    return relationships
}

function buildIdMap(elements: ElementEntry[], relationships: RelationshipEntry[], idToName: Map<string, string>): Map<string, string> {
    const idMap = new Map<string, string>()
    let counter = 1

    // Sort elements canonically: type:parentName/name
    const sorted = [...elements].sort((a, b) => {
        const keyA = `${a.type}:${a.parentName ?? ''}/${a.name}`
        const keyB = `${b.type}:${b.parentName ?? ''}/${b.name}`
        return keyA.localeCompare(keyB)
    })
    for (const el of sorted) {
        idMap.set(el.id, String(counter++))
    }

    // Sort relationships: sourceName, destName, description
    const sortedRels = [...relationships].sort((a, b) => {
        const srcA = idToName.get(a.sourceId) ?? a.sourceId
        const srcB = idToName.get(b.sourceId) ?? b.sourceId
        const dstA = idToName.get(a.destinationId) ?? a.destinationId
        const dstB = idToName.get(b.destinationId) ?? b.destinationId
        return srcA.localeCompare(srcB) || dstA.localeCompare(dstB) || a.description.localeCompare(b.description)
    })
    for (const rel of sortedRels) {
        idMap.set(rel.id, String(counter++))
    }

    return idMap
}

const ID_FIELDS = new Set(['id', 'sourceId', 'destinationId', 'parentId', 'elementId', 'softwareSystemId', 'containerId', 'perspectiveId'])

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function replaceIds(value: unknown, idMap: Map<string, string>): any {
    if (value === null || value === undefined) return value
    if (typeof value === 'string') return idMap.get(value) ?? value
    if (Array.isArray(value)) {
        return value.map((item) => replaceIds(item, idMap))
    }
    if (typeof value === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Record<string, any> = {}
        for (const [k, v] of Object.entries(value as AnyObject)) {
            if (ID_FIELDS.has(k)) {
                result[k] = typeof v === 'string' ? (idMap.get(v) ?? v) : v
            } else {
                result[k] = replaceIds(v, idMap)
            }
        }
        return result
    }
    return value
}

/**
 * Strips implementation-specific relationship fields and normalizes default descriptions.
 * - Removes `linkedRelationshipId` (implementation detail of which container relationship
 *   is the "source" for an implied relationship — differs between !elements DSL and explicit TypeScript)
 * - Removes `description: "uses"` from relationship objects (our library's default description
 *   is semantically equivalent to no description in the cookbook's bare `a -> b` syntax)
 * - Normalizes relationship style `style: "Solid"` → `dashed: false` (cookbook DSL uses `dashed false`
 *   which produces `"dashed": false` in JSON, while our library uses `style solid` → `"style": "Solid"`)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripImplicitFields(value: unknown): any {
    if (value === null || value === undefined) return value
    if (Array.isArray(value)) return value.map(stripImplicitFields)
    if (typeof value === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Record<string, any> = {}
        for (const [k, v] of Object.entries(value as AnyObject)) {
            if (k === 'linkedRelationshipId') continue
            result[k] = stripImplicitFields(v)
        }
        // Normalize default "uses" description on relationship-like objects
        if (('sourceId' in result || 'destinationId' in result) && result['description'] === 'uses') {
            delete result['description']
        }
        // Normalize solid line style: `style: "Solid"` ↔ `dashed: false`
        // Cookbook DSL uses `dashed false` → JSON: `"dashed": false`
        // Our library uses `style: 'solid'` → JSON: `"style": "Solid"`
        if ('tag' in result && !('sourceId' in result) && !('destinationId' in result)) {
            if (result['style'] === 'Solid') {
                delete result['style']
                result['dashed'] = false
            }
        }
        return result
    }
    return value
}

/**
 * Sorts view element/relationship arrays by their normalized ID so ordering
 * differences (which are arbitrary) don't cause test failures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortViewArrays(obj: any): any {
    if (obj === null || obj === undefined) return obj
    if (Array.isArray(obj)) return obj.map(sortViewArrays)
    if (typeof obj !== 'object') return obj

    const result: AnyObject = {}
    for (const [k, v] of Object.entries(obj as AnyObject)) {
        if ((k === 'elements' || k === 'relationships') && Array.isArray(v)) {
            result[k] = [...v.map(sortViewArrays)].sort((a, b) => String(a.id ?? '').localeCompare(String(b.id ?? '')))
        } else {
            result[k] = sortViewArrays(v)
        }
    }
    return result
}

function buildIdToNameMap(elements: ElementEntry[]): Map<string, string> {
    const m = new Map<string, string>()
    for (const el of elements) {
        m.set(el.id, el.name)
    }
    return m
}

// Property keys that are DSL-implementation-specific, not part of the architecture
const STRIP_PROPERTY_KEYS = new Set([
    'structurizr.dsl',
    'structurizr.dsl.identifier',
    'structurizr.inspection.error',
    'structurizr.inspection.warning',
    'structurizr.inspection.info',
    'structurizr.inspection.ignore',
])

function stripProperties(obj: AnyObject): AnyObject {
    if (!obj.properties || typeof obj.properties !== 'object') return obj
    const filtered = Object.fromEntries(Object.entries(obj.properties as AnyObject).filter(([k]) => !STRIP_PROPERTY_KEYS.has(k)))
    const result = { ...obj, properties: filtered }
    if (Object.keys(result.properties).length === 0) delete result.properties
    return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripPropertiesDeep(value: unknown): any {
    if (value === null || value === undefined) return value
    if (Array.isArray(value)) return value.map(stripPropertiesDeep)
    if (typeof value === 'object') {
        const obj = value as AnyObject
        const stripped = stripProperties(obj)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result: Record<string, any> = {}
        for (const [k, v] of Object.entries(stripped)) {
            result[k] = k === 'properties' ? v : stripPropertiesDeep(v)
        }
        return result
    }
    return value
}

function stripMetadata(ws: AnyObject): AnyObject {
    const result = { ...ws }
    delete result.name
    delete result.description
    if (result.views && typeof result.views === 'object') {
        const views = { ...result.views }
        for (const [viewType, viewArray] of Object.entries(views)) {
            if (Array.isArray(viewArray)) {
                views[viewType] = viewArray.map((v: AnyObject) => {
                    const view = { ...v }
                    delete view.key
                    delete view.description
                    delete view.generatedKey
                    return view
                })
            }
        }
        result.views = views
    }
    return result
}

function sortViewsByContent(ws: AnyObject): AnyObject {
    const result = { ...ws }
    if (result.views && typeof result.views === 'object') {
        const views = { ...result.views }
        for (const [viewType, viewArray] of Object.entries(views)) {
            if (Array.isArray(viewArray)) {
                views[viewType] = [...viewArray].sort((a: AnyObject, b: AnyObject) => {
                    const keyA = JSON.stringify((a.elements ?? []).map((e: AnyObject) => e.id).sort())
                    const keyB = JSON.stringify((b.elements ?? []).map((e: AnyObject) => e.id).sort())
                    return keyA.localeCompare(keyB)
                })
            }
        }
        result.views = views
    }
    return result
}

function normalize(workspace: unknown): unknown {
    const ws = workspace as AnyObject
    const stripped = stripMetadata(stripPropertiesDeep(ws) as AnyObject)
    const elements = collectElements(stripped)
    const idToName = buildIdToNameMap(elements)
    const relationships = collectRelationships(stripped)
    const idMap = buildIdMap(elements, relationships, idToName)
    const withIds = replaceIds(stripped, idMap)
    const withoutImplicit = stripImplicitFields(withIds)
    const sorted = sortViewArrays(withoutImplicit)
    return sortViewsByContent(sorted)
}

/**
 * Semantically compares two Structurizr workspace JSON objects by normalizing
 * auto-generated element/relationship IDs to canonical sequential integers,
 * then asserting deep equality.
 */
export function compareWorkspaceJsonSemantics(original: unknown, generated: unknown): void {
    const normalizedOriginal = normalize(original)
    const normalizedGenerated = normalize(generated)
    expect(normalizedGenerated).toEqual(normalizedOriginal)
}
