import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeHandle } from "./NodeHandle";
import { type UploadImageNodeData } from "@/lib/types";
import { Image as ImageIcon, UploadCloud } from "lucide-react";

export const UploadImageNode = memo(function UploadImageNode({ id, data, selected }: NodeProps<Node<UploadImageNodeData>>) {
  return (
    <BaseNode
      id={id}
      type="uploadImageNode"
      label={data.label}
      icon={<ImageIcon className="w-3.5 h-3.5 text-handle-image" />}
      status={data.status}
      selected={selected}
      minWidth={280}
    >
      <div className="flex flex-col gap-3">
        {data.imageUrl ? (
          <div className="relative w-full aspect-video rounded overflow-hidden border border-node-border bg-black flex items-center justify-center">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={data.imageUrl} alt={data.fileName} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-24 border-2 border-dashed border-node-border hover:border-handle-image rounded-lg bg-input-bg/50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors">
             <UploadCloud className="w-6 h-6 text-text-muted" />
             <span className="text-xs text-text-muted font-medium">Click or drug to upload</span>
             <span className="text-[9px] text-[#52525b]">JPG, PNG, WEBP, GIF</span>
          </div>
        )}

        <div className="flex justify-end mt-1 pt-3 border-t border-node-border">
          <NodeHandle id="output" type="source" dataType="image" label="image url" />
        </div>
      </div>
    </BaseNode>
  );
});

