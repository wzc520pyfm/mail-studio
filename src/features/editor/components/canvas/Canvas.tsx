/**
 * Canvas - Main canvas component for visual editing
 */

"use client";

import { memo } from "react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { cn } from "@/lib/utils";
import { Breadcrumb } from "./Breadcrumb";
import { CanvasBody } from "./CanvasBody";

export const Canvas = memo(function Canvas() {
  const document = useEditorStore((s) => s.document);
  const isDragging = useUIStore((s) => s.isDragging);

  return (
    <div className="h-full bg-muted/50 flex flex-col">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Canvas Area */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex items-start justify-center p-8">
          <div
            className={cn(
              "bg-white shadow-lg rounded-lg transition-shadow duration-200",
              isDragging && "shadow-xl ring-2 ring-blue-100"
            )}
            style={{ width: "600px", minHeight: "400px" }}
          >
            <CanvasBody node={document} />
          </div>
        </div>
      </div>

      {/* Drag hint */}
      {isDragging && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-900 text-white text-sm rounded-full shadow-lg z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2">
          Release to drop the component
        </div>
      )}
    </div>
  );
});
