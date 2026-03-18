import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'

const hiddenHandle = { opacity: 0, pointerEvents: 'none' as const }

const baseNodeStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '176px',
    height: '80px',
    borderRadius: '4px',
    padding: '8px 12px',
    color: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
}

const labelStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    lineHeight: '1.25',
}

const typeStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '12px',
    opacity: 0.8,
    marginTop: '2px',
}

const descStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '12px',
    opacity: 0.7,
    marginTop: '4px',
}

function Handles() {
    return (
        <>
            <Handle type="target" position={Position.Top} isConnectable={false} style={hiddenHandle} />
            <Handle type="source" position={Position.Bottom} isConnectable={false} style={hiddenHandle} />
            <Handle type="target" position={Position.Left} isConnectable={false} style={hiddenHandle} />
            <Handle type="source" position={Position.Right} isConnectable={false} style={hiddenHandle} />
        </>
    )
}

function bgColor(isExternal: boolean) {
    return isExternal ? '#6b7280' : '#2563eb' // gray-500 / blue-600
}

// Person node
type PersonNodeData = { label: string; elementType: string; description?: string; isExternal: boolean }
type PersonNodeType = Node<PersonNodeData, 'personNode'>

export function SsrPersonNode({ data }: NodeProps<PersonNodeType>) {
    return (
        <div style={{ ...baseNodeStyle, backgroundColor: bgColor(data.isExternal) }}>
            <Handles />
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
            <span style={labelStyle}>{data.label}</span>
            <span style={typeStyle}>[Person]</span>
            {data.description && <span style={descStyle}>{data.description}</span>}
        </div>
    )
}

// Software System node
type SoftwareSystemNodeData = { label: string; elementType: string; description?: string; isExternal: boolean }
type SoftwareSystemNodeType = Node<SoftwareSystemNodeData, 'softwareSystemNode'>

export function SsrSoftwareSystemNode({ data }: NodeProps<SoftwareSystemNodeType>) {
    return (
        <div style={{ ...baseNodeStyle, backgroundColor: bgColor(data.isExternal) }}>
            <Handles />
            <span style={labelStyle}>{data.label}</span>
            <span style={typeStyle}>[Software System]</span>
            {data.description && <span style={descStyle}>{data.description}</span>}
        </div>
    )
}

// Container node
type ContainerNodeData = { label: string; elementType: string; description?: string; technology?: string; isExternal: boolean }
type ContainerNodeType = Node<ContainerNodeData, 'containerNode'>

export function SsrContainerNode({ data }: NodeProps<ContainerNodeType>) {
    const typeLabel = data.technology ? `[Container: ${data.technology}]` : '[Container]'
    return (
        <div style={{ ...baseNodeStyle, backgroundColor: bgColor(data.isExternal) }}>
            <Handles />
            <span style={labelStyle}>{data.label}</span>
            <span style={typeStyle}>{typeLabel}</span>
            {data.description && <span style={descStyle}>{data.description}</span>}
        </div>
    )
}

// Group node
type GroupNodeData = { label: string }
type GroupNodeType = Node<GroupNodeData, 'groupNode'>

export function SsrGroupNode({ data }: NodeProps<GroupNodeType>) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                borderRadius: '4px',
                border: '2px dashed #9ca3af',
                backgroundColor: 'transparent',
            }}
        >
            <Handles />
            <span
                style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#4b5563',
                }}
            >
                {data.label}
            </span>
        </div>
    )
}
