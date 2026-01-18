/**
 * Hook for managing drag state in the canvas
 */

import { useState, useCallback } from "react";
import { useDndMonitor, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import type { DragState } from "@/features/editor/types";

const initialDragState: DragState = {
  isDragging: false,
  activeId: null,
  overId: null,
  overPosition: null,
};

export function useDragState() {
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragState({
      isDragging: true,
      activeId: event.active.id as string,
      overId: null,
      overPosition: null,
    });
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    if (event.over) {
      const overRect = event.over.rect;
      const activeRect = event.active.rect.current.translated;

      let position: "before" | "after" | "inside" = "inside";

      if (overRect && activeRect) {
        const activeCenter = activeRect.top + activeRect.height / 2;

        // Determine position based on mouse position relative to element center
        if (activeCenter < overRect.top + overRect.height * 0.3) {
          position = "before";
        } else if (activeCenter > overRect.top + overRect.height * 0.7) {
          position = "after";
        }
      }

      setDragState((prev) => ({
        ...prev,
        overId: event.over?.id as string,
        overPosition: position,
      }));
    } else {
      setDragState((prev) => ({
        ...prev,
        overId: null,
        overPosition: null,
      }));
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  const handleDragCancel = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  // Monitor drag events
  useDndMonitor({
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  });

  return dragState;
}
