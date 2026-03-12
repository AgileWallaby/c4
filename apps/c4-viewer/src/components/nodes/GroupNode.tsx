import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";

const hiddenHandle = { opacity: 0, pointerEvents: "none" as const };

type GroupNodeType = Node<
  {
    label: string;
  },
  "groupNode"
>;

export function GroupNode({ data }: NodeProps<GroupNodeType>) {
  return (
    <div className="h-full w-full rounded border-2 border-dashed border-gray-400 bg-transparent">
      <Handle type="target" position={Position.Top} isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={hiddenHandle} />
      <Handle type="target" position={Position.Left} isConnectable={false} style={hiddenHandle} />
      <Handle type="source" position={Position.Right} isConnectable={false} style={hiddenHandle} />
      <span className="px-2 pt-1 text-xs font-semibold text-gray-600">
        {data.label}
      </span>
    </div>
  );
}
