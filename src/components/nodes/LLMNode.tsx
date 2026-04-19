import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeHandle } from "./NodeHandle";
import { type LLMNodeData } from "@/lib/types";
import { Brain, Sparkles } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";
import { GEMINI_MODELS } from "@/lib/types";

export const LLMNode = memo(function LLMNode({ id, data, selected }: NodeProps<Node<LLMNodeData>>) {
  const { updateNodeData, isInputConnected } = useWorkflowStore();

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateNodeData(id, { model: e.target.value });
  };

  const hasSystemPrompt = isInputConnected(id, "system_prompt");
  const hasUserMessage = isInputConnected(id, "user_message");
  const hasImages = isInputConnected(id, "images");

  return (
    <BaseNode
      id={id}
      type="llmNode"
      label={data.label}
      icon={<Brain className="w-3.5 h-3.5 text-accent-purple" />}
      status={data.status}
      selected={selected}
      minWidth={320}
      onRun={() => console.log("Run LLM", id)}
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[10px] font-medium text-text-secondary uppercase tracking-widest">Model</span>
          <select
            value={data.model}
            onChange={handleModelChange}
            className="w-full px-2 py-1.5 text-xs bg-input-bg border border-input-border rounded text-text-primary focus:border-accent-purple"
          >
            {GEMINI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </label>

        <div className="flex items-center justify-between border-t border-node-border pt-3 mt-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <NodeHandle id="system_prompt" type="target" dataType="text" />
              <span className="text-xs text-text-muted">{hasSystemPrompt ? "Connected" : "System Prompt (opt)"}</span>
            </div>
            <div className="flex items-center gap-2">
              <NodeHandle id="user_message" type="target" dataType="text" />
              <span className={`text-xs ${hasUserMessage ? "text-text-muted" : "text-text-primary"}`}>
                {hasUserMessage ? "Connected" : "User Message *"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NodeHandle id="images" type="target" dataType="image" />
              <span className="text-xs text-text-muted">{hasImages ? "Connected" : "Images (opt, mult)"}</span>
            </div>
          </div>
        </div>

        {data.result && (
          <div className="mt-2 pt-3 border-t border-node-border">
            <span className="text-[10px] font-medium text-success uppercase flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3" /> Output
            </span>
            <div className="text-xs text-text-primary bg-input-bg/50 p-2 rounded border border-input-border max-h-[150px] overflow-y-auto w-full break-words">
               {data.result}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-1 pt-3 border-t border-node-border">
          <NodeHandle id="output" type="source" dataType="text" label="response" />
        </div>
      </div>
    </BaseNode>
  );
});

