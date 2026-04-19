import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeHandle } from "./NodeHandle";
import { type ExtractFrameNodeData } from "@/lib/types";
import { Film } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

export const ExtractFrameNode = memo(function ExtractFrameNode({ id, data, selected }: NodeProps<Node<ExtractFrameNodeData>>) {
  const { updateNodeData, isInputConnected } = useWorkflowStore();

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { timestamp: e.target.value });
  };

  const hasVideo = isInputConnected(id, "video_url");
  const hasTimestamp = isInputConnected(id, "timestamp");

  return (
    <BaseNode
      id={id}
      type="extractFrameNode"
      label={data.label}
      icon={<Film className="w-3.5 h-3.5 text-[#06B6D4]" />}
      status={data.status}
      selected={selected}
      minWidth={280}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <NodeHandle id="video_url" type="target" dataType="video" />
          <span className={`text-xs ${hasVideo ? "text-text-muted" : "text-text-primary"}`}>
             {hasVideo ? "Connected" : "Video URL *"}
          </span>
        </div>

        <label className="flex flex-col gap-1.5 relative ml-6">
          <span className="text-[10px] font-medium text-text-secondary">Timestamp (s or %)</span>
          <input
            type="text"
            value={data.timestamp}
            onChange={handleTimestampChange}
            disabled={hasTimestamp}
            placeholder="e.g., 5s or 50%"
            className="w-full px-2 py-1.5 text-xs bg-input-bg border border-input-border rounded text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute -left-10 top-7">
             <NodeHandle id="timestamp" type="target" dataType="text" />
          </div>
        </label>

        {data.frameUrl && (
          <div className="mt-2 pt-3 border-t border-node-border">
            <span className="text-[10px] font-medium text-success uppercase mb-1.5 block">Preview</span>
            <div className="relative w-full aspect-video rounded overflow-hidden border border-node-border bg-black flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={data.frameUrl} alt="Extracted frame" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-1 pt-3 border-t border-node-border">
          <NodeHandle id="output" type="source" dataType="image" label="frame image" />
        </div>
      </div>
    </BaseNode>
  );
});

