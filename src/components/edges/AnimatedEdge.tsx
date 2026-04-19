import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from "@xyflow/react";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflowStore";

export function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges, pushHistory, edges } = useWorkflowStore();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.stopPropagation();
    pushHistory();
    setEdges(edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} className="react-flow__edge-path" />
      
      {/* Animated layer */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0.8}
        className="react-flow__edge-path animate-[edgeFlow_0.5s_linear_infinite]"
        strokeDasharray="5 5"
        style={{
          stroke: style.stroke || "#8B5CF6",
          strokeWidth: style.strokeWidth || 2,
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all", // allows clicking the button
          }}
          className="nodrag nopan opacity-0 hover:opacity-100 transition-opacity"
        >
          <button
            className="w-5 h-5 flex items-center justify-center rounded-full bg-error text-white hover:bg-error/80 hover:scale-110 shadow-lg transition-all"
            onClick={onEdgeClick}
            title="Delete connection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
