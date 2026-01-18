/**
 * Droppable container for drag and drop
 */

"use client";

import { memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { MJMLComponentType } from "@/features/editor/types";
import { useUIStore } from "@/features/editor/stores";
import { cn } from "@/lib/utils";

interface DroppableContainerProps {
  nodeId: string;
  acceptTypes: MJMLComponentType[];
  children: React.ReactNode;
}

export const DroppableContainer = memo(function DroppableContainer({
  nodeId,
  acceptTypes,
  children,
}: DroppableContainerProps) {
  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { isOver, setNodeRef, active } = useDroppable({
    id: `drop-${nodeId}`,
    data: {
      nodeId,
      acceptTypes,
      index: 0,
    },
  });

  // Check if the dragged type is acceptable
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isAcceptable = !activeType || acceptTypes.includes(activeType);

  // Show visual feedback only during NEW component drag (not during reorder)
  const showAcceptableHighlight = isDraggingNewComponent && isAcceptable;
  const showNotAcceptableHighlight = isDraggingNewComponent && activeType && !isAcceptable;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200 min-h-[20px] relative",
        // Highlight when dragging over and acceptable
        isOver && isAcceptable && "bg-blue-50/60 ring-2 ring-blue-400 ring-inset rounded-sm",
        // Show warning when not acceptable
        isOver && !isAcceptable && "bg-red-50/60 ring-2 ring-red-300 ring-inset rounded-sm",
        // Very subtle highlight when dragging compatible NEW items but not over this container
        showAcceptableHighlight && !isOver && "bg-blue-50/10",
        // Slight dim appearance when dragging incompatible NEW items
        showNotAcceptableHighlight && !isOver && "opacity-80"
      )}
    >
      {children}

      {/* Drop zone overlay when dragging over and acceptable */}
      {isOver && isAcceptable && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-full shadow-lg animate-in zoom-in-90 duration-150">
            Drop here
          </div>
        </div>
      )}

      {/* Warning overlay when not acceptable */}
      {isOver && !isAcceptable && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-full shadow-lg animate-in zoom-in-90 duration-150">
            Cannot drop here
          </div>
        </div>
      )}
    </div>
  );
});
