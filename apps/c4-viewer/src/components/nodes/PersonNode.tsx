import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";

const hiddenHandle = { opacity: 0, pointerEvents: "none" as const };

type PersonNodeType = Node<
  {
    label: string;
    elementType: string;
    description?: string;
    isExternal: boolean;
  },
  "personNode"
>;

export function PersonNode({ data }: NodeProps<PersonNodeType>) {
  const bg = data.isExternal ? "bg-gray-500" : "bg-blue-600";

  return (
    <div
      className={`${bg} flex w-40 flex-col items-center rounded px-3 pb-3 pt-2 text-white shadow`}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={hiddenHandle} />
      <Handle type="target" position={Position.Left} isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Right} isConnectable={false} style={hiddenHandle} />
      {/* Person silhouette icon */}
      <svg
        aria-hidden="true"
        className="mb-1 h-8 w-8"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>

      <span className="text-center text-sm font-bold leading-tight">
        {data.label}
      </span>
      <span className="mt-0.5 text-center text-xs opacity-80">[Person]</span>
      {data.description && (
        <span className="mt-1 text-center text-xs opacity-70">
          {data.description}
        </span>
      )}
    </div>
  );
}
