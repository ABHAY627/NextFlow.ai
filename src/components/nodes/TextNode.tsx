import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeHandle } from "./NodeHandle";
import { type TextNodeData } from "@/lib/types";
import { Type } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

export const TextNode = memo(function TextNode({ id, data, selected }: NodeProps<Node<TextNodeData>>) {
  const { updateNodeData } = useWorkflowStore();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNodeData(id, { text: e.target.value });
  };

  return (
    <BaseNode
      id={id}
      type="textNode"
      label={data.label}
      icon={<Type className="w-3.5 h-3.5 text-accent-blue" />}
      status={data.status}
      selected={selected}
      minWidth={300}
    >
      <div className="flex flex-col gap-2">
        <textarea
          value={data.text || ""}
          onChange={handleTextChange}
          placeholder="Enter text..."
          className="w-full min-h-[80px] p-2 text-xs bg-input-bg border border-input-border rounded bg-opacity-50 text-text-primary placeholder-text-muted resize-y focus:outline-none focus:border-accent-blue transition-colors"
        />
        
        <div className="flex justify-end mt-2 pt-2 border-t border-node-border">
          <NodeHandle id="output" type="source" dataType="text" label="text" />
        </div>
      </div>
    </BaseNode>
  );
});

