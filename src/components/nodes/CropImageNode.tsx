import { memo } from "react";
import { type NodeProps, type Node } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { NodeHandle } from "./NodeHandle";
import { type CropImageNodeData } from "@/lib/types";
import { Crop } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

export const CropImageNode = memo(function CropImageNode({ id, data, selected }: NodeProps<Node<CropImageNodeData>>) {
  const { updateNodeData, isInputConnected } = useWorkflowStore();

  const handleNumChange = (field: keyof CropImageNodeData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { [field]: Number(e.target.value) });
  };

  const hasImage = isInputConnected(id, "image_url");
  const hasX = isInputConnected(id, "x_percent");
  const hasY = isInputConnected(id, "y_percent");
  const hasW = isInputConnected(id, "width_percent");
  const hasH = isInputConnected(id, "height_percent");

  return (
    <BaseNode
      id={id}
      type="cropImageNode"
      label={data.label}
      icon={<Crop className="w-3.5 h-3.5 text-[#EC4899]" />}
      status={data.status}
      selected={selected}
      minWidth={300}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-2">
          <NodeHandle id="image_url" type="target" dataType="image" />
          <span className={`text-xs ${hasImage ? "text-text-muted" : "text-text-primary"}`}>
             {hasImage ? "Connected" : "Image URL *"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 relative">
            <span className="text-[10px] font-medium text-text-secondary">X (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={data.xPercent}
              onChange={handleNumChange("xPercent")}
              disabled={hasX}
              className="w-full px-2 py-1.5 text-xs bg-input-bg border border-input-border rounded text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute -left-4 top-7">
               <NodeHandle id="x_percent" type="target" dataType="number" />
            </div>
          </label>
          <label className="flex flex-col gap-1.5 relative">
            <span className="text-[10px] font-medium text-text-secondary">Y (%)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={data.yPercent}
              onChange={handleNumChange("yPercent")}
              disabled={hasY}
              className="w-full px-2 py-1.5 text-xs bg-input-bg border border-input-border rounded text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute -left-4 top-7">
               <NodeHandle id="y_percent" type="target" dataType="number" />
            </div>
          </label>
          <label className="flex flex-col gap-1.5 relative">
            <span className="text-[10px] font-medium text-text-secondary">Width (%)</span>
            <input
              type="number"
              min="1"
              max="100"
              value={data.widthPercent}
              onChange={handleNumChange("widthPercent")}
              disabled={hasW}
              className="w-full px-2 py-1.5 text-xs bg-input-bg border border-input-border rounded text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute -left-4 top-7">
               <NodeHandle id="width_percent" type="target" dataType="number" />
            </div>
          </label>
          <label className="flex flex-col gap-1.5 relative">
            <span className="text-[10px] font-medium text-text-secondary">Height (%)</span>
            <input
              type="number"
              min="1"
              max="100"
              value={data.heightPercent}
              onChange={handleNumChange("heightPercent")}
              disabled={hasH}
              className="w-full px-2 py-1.5 text-xs bg-input-bg border border-input-border rounded text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute -left-4 top-7">
               <NodeHandle id="height_percent" type="target" dataType="number" />
            </div>
          </label>
        </div>

        {data.croppedUrl && (
          <div className="mt-2 pt-3 border-t border-node-border">
            <span className="text-[10px] font-medium text-success uppercase mb-1.5 block">Preview</span>
            <div className="relative w-full aspect-video rounded overflow-hidden border border-node-border bg-black flex items-center justify-center">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={data.croppedUrl} alt="Cropped" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-1 pt-3 border-t border-node-border">
          <NodeHandle id="output" type="source" dataType="image" label="cropped image" />
        </div>
      </div>
    </BaseNode>
  );
});

