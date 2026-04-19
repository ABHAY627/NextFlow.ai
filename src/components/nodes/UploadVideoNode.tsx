import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeHandle } from "./NodeHandle";
import { type UploadVideoNodeData } from "@/lib/types";
import { Video, UploadCloud } from "lucide-react";

export const UploadVideoNode = memo(function UploadVideoNode({ id, data, selected }: NodeProps<Node<UploadVideoNodeData>>) {
  return (
    <BaseNode
      id={id}
      type="uploadVideoNode"
      label={data.label}
      icon={<Video className="w-3.5 h-3.5 text-handle-video" />}
      status={data.status}
      selected={selected}
      minWidth={280}
    >
      <div className="flex flex-col gap-3">
        {data.videoUrl ? (
          <div className="relative w-full aspect-video rounded overflow-hidden border border-node-border bg-black flex items-center justify-center">
             <video src={data.videoUrl} controls className="max-w-full max-h-full" />
          </div>
        ) : (
          <div className="w-full h-24 border-2 border-dashed border-node-border hover:border-handle-video rounded-lg bg-input-bg/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
             <UploadCloud className="w-6 h-6 text-text-muted" />
             <span className="text-xs text-text-muted font-medium">Click or drag video</span>
             <span className="text-[9px] text-[#52525b]">MP4, WEBM, MOV</span>
          </div>
        )}

        <div className="flex justify-end mt-1 pt-3 border-t border-node-border">
          <NodeHandle id="output" type="source" dataType="video" label="video url" />
        </div>
      </div>
    </BaseNode>
  );
});

