/**
 * Empty drop zone placeholder
 */

"use client";

import { memo, useContext } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { MJMLComponentType } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { DragStateContext } from "./DragStateContext";

interface EmptyDropZoneProps {
  nodeId: string;
  message: string;
  small?: boolean;
  acceptTypes?: MJMLComponentType[];
  index?: number;
}

export const EmptyDropZone = memo(function EmptyDropZone({
  nodeId,
  message,
  small = false,
  acceptTypes,
  index = 0,
}: EmptyDropZoneProps) {
  const dragState = useContext(DragStateContext);
  const { isOver, setNodeRef, active } = useDroppable({
    id: `empty-${nodeId}${index > 0 ? `-${index}` : ""}`,
    data: {
      nodeId,
      acceptTypes,
      index,
    },
  });

  // Check if the dragged type is acceptable
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isAcceptable = !acceptTypes || !activeType || acceptTypes.includes(activeType);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200",
        small ? "p-4 min-h-[60px]" : "p-8 min-h-[120px]",
        // Default state
        !dragState.isDragging && "border-gray-300 bg-gray-50/50",
        // Dragging acceptable type (ready to receive)
        dragState.isDragging &&
          isAcceptable &&
          !isOver &&
          "border-blue-300 bg-blue-50/30 animate-pulse",
        // Dragging non-acceptable type
        dragState.isDragging &&
          !isAcceptable &&
          !isOver &&
          "border-gray-300 bg-gray-100/50 opacity-50",
        // Hovering over with acceptable type
        isOver && isAcceptable && "border-blue-500 bg-blue-100/50 scale-[1.02] shadow-inner",
        // Hovering over with non-acceptable type
        isOver && !isAcceptable && "border-red-400 bg-red-100/50"
      )}
    >
      {dragState.isDragging ? (
        isAcceptable ? (
          <>
            <Plus className={cn("text-blue-500 mb-1", small ? "w-5 h-5" : "w-8 h-8")} />
            <span className={cn("text-blue-600 font-medium", small ? "text-xs" : "text-sm")}>
              {isOver ? "Release to drop" : message}
            </span>
          </>
        ) : (
          <span className={cn("text-gray-400", small ? "text-xs" : "text-sm")}>
            {isOver ? "Cannot drop here" : message}
          </span>
        )
      ) : (
        <span className={cn("text-gray-400", small ? "text-xs" : "text-sm")}>{message}</span>
      )}
    </div>
  );
});
