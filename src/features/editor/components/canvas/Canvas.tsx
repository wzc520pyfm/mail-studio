/**
 * Canvas - Main canvas component for visual editing
 */

"use client";

import { memo, useCallback } from "react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./Breadcrumb";
import { CanvasBody } from "./CanvasBody";
import { CanvasWidthControl } from "../CanvasWidthControl";

export const Canvas = memo(function Canvas() {
  const document = useEditorStore((s) => s.document);
  const isDragging = useUIStore((s) => s.isDragging);
  const canvasWidth = useUIStore((s) => s.canvasWidth);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);

  // Clear selection when clicking on empty canvas area
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      // Only clear if clicking directly on the canvas background (not on child elements)
      if (e.target === e.currentTarget) {
        setSelectedId(null);
      }
    },
    [setSelectedId]
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto" onClick={handleCanvasClick}>
        <div className="min-h-full flex justify-center py-12" onClick={handleCanvasClick}>
          <div
            className={cn("w-full", isDragging && "ring-2 ring-blue-100")}
            style={{ maxWidth: `${canvasWidth}px`, minHeight: "400px" }}
          >
            <CanvasBody node={document} />
          </div>
        </div>
      </div>

      {/* Canvas Width Control */}
      <CanvasWidthControl />

      {/* Drag hint */}
      {isDragging && (
        <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded-full shadow-lg z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          Release to drop the component
        </div>
      )}
    </div>
  );
});
