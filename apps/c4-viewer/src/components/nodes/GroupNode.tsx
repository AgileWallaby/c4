import { Handle, Position } from "@xyflow/react";
import type { NodeProps, Node } from "@xyflow/react";

type GroupNodeType = Node<
  {
    label: string;
  },
  "groupNode"
>;

export function GroupNode({ data }: NodeProps<GroupNodeType>) {
  return (
    <div className="h-full w-full rounded border-2 border-dashed border-gray-400 bg-transparent">
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <span className="px-2 pt-1 text-xs font-semibold text-gray-600">
        {data.label}
      </span>
    </div>
  );
}
