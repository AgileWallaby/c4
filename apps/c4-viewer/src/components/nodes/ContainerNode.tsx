import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";

const hiddenHandle = { opacity: 0, pointerEvents: "none" as const };

type ContainerNodeType = Node<
  {
    label: string;
    elementType: string;
    description?: string;
    technology?: string;
    isExternal: boolean;
  },
  "containerNode"
>;

export function ContainerNode({ data }: NodeProps<ContainerNodeType>) {
  const bg = data.isExternal ? "bg-gray-500" : "bg-blue-600";
  const typeLabel = data.technology
    ? `[Container: ${data.technology}]`
    : "[Container]";

  return (
    <div
      className={`${bg} flex w-44 flex-col items-center rounded px-3 pb-3 pt-2 text-white shadow`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={hiddenHandle} />
      <Handle type="target" position={Position.Left} isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Right} isConnectable={false} style={hiddenHandle} />
      <span className="text-center text-sm font-bold leading-tight">
        {data.label}
      </span>
      <span className="mt-0.5 text-center text-xs opacity-80">{typeLabel}</span>
      {data.description && (
        <span className="mt-1 text-center text-xs opacity-70">
          {data.description}
        </span>
      )}
    </div>
  );
}
