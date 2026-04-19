import { Handle, Position } from "@xyflow/react";
import type { HandleDataType } from "@/lib/types";

interface NodeHandleProps {
  id: string;
  type: "source" | "target";
  dataType: HandleDataType;
  position?: Position;
  label?: string;
  className?: string;
}

const colorMap: Record<HandleDataType, string> = {
  text: "var(--handle-text)",
  image: "var(--handle-image)",
  video: "var(--handle-video)",
  number: "var(--handle-number)",
};

export function NodeHandle({
  id,
  type,
  dataType,
  position,
  label,
  className = "",
}: NodeHandleProps) {
  const isTarget = type === "target";
  const defaultPosition = isTarget ? Position.Left : Position.Right;
  const color = colorMap[dataType];

  return (
    <div className={`relative flex items-center ${isTarget ? "flex-row" : "flex-row-reverse"} ${className}`}>
      <Handle
        id={id}
        type={type}
        position={position || defaultPosition}
        className={`w-3 h-3 !border-2 !border-[#3a3a3a] !bg-[#1a1a1a] transition-all hover:scale-125 hover:z-50 z-20 ${
          isTarget ? "!-left-1.5" : "!-right-1.5"
        }`}
        style={{
          // We can use custom properties to drive hover colors or set it directly
        }}
        // Adding inline styles dynamically to ensure colors are applied when hovered
        // In actual Krea design, hover adds a glow of the handle's specific color
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.boxShadow = `0 0 8px ${color}80`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#3a3a3a";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {label && (
        <span
          className={`text-[10px] font-medium text-text-secondary select-none px-2 ${
            isTarget ? "mr-1" : "ml-1"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
