import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";

const hiddenHandle = { opacity: 0, pointerEvents: "none" as const };

type SoftwareSystemNodeType = Node<
  {
    label: string;
    elementType: string;
    description?: string;
    isExternal: boolean;
  },
  "softwareSystemNode"
>;

export function SoftwareSystemNode({
  data,
}: NodeProps<SoftwareSystemNodeType>) {
  const bg = data.isExternal ? "bg-gray-500" : "bg-blue-600";

  return (
    <div
      className={`${bg} flex h-20 w-44 flex-col items-center justify-center rounded px-3 py-2 text-white shadow`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={hiddenHandle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={hiddenHandle}
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        style={hiddenHandle}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        style={hiddenHandle}
      />
      <span className="text-center text-sm font-bold leading-tight">
        {data.label}
      </span>
      <span className="mt-0.5 text-center text-xs opacity-80">
        [Software System]
      </span>
      {data.description && (
        <span className="mt-1 text-center text-xs opacity-70">
          {data.description}
        </span>
      )}
    </div>
  );
}
