/**
 * Droppable container for drag and drop
 */

"use client";

import { memo, useContext } from "react";
import { useDroppable } from "@dnd-kit/core";
import type { MJMLComponentType } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { DragStateContext } from "./DragStateContext";

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
  const dragState = useContext(DragStateContext);
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

  // Show visual feedback during drag
  const showAcceptableHighlight = dragState.isDragging && isAcceptable;
  const showNotAcceptableHighlight = dragState.isDragging && activeType && !isAcceptable;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200 min-h-[20px] relative",
        // Highlight when dragging over and acceptable
        isOver && isAcceptable && "bg-blue-50/60 ring-2 ring-blue-400 ring-inset rounded-sm",
        // Show warning when not acceptable
        isOver && !isAcceptable && "bg-red-50/60 ring-2 ring-red-300 ring-inset rounded-sm",
        // Subtle highlight when dragging compatible items but not over this container
        showAcceptableHighlight && !isOver && "bg-blue-50/20",
        // Dim appearance when dragging incompatible items
        showNotAcceptableHighlight && !isOver && "opacity-50"
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
