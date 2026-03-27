/**
 * ResizableEmailContainer - Wraps email content with a bottom mini width
 * indicator for adjusting canvas width in Edit mode.
 *
 * Shows a tiny width label at the bottom center. On hover it reveals a
 * horizontal drag handle (⟷). Drag left/right to resize.
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { cn } from "@/lib/utils";
import { GripHorizontal } from "lucide-react";

const MIN_WIDTH = 320;
const MAX_WIDTH = 960;

interface ResizableEmailContainerProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function ResizableEmailContainer({ children, onClick }: ResizableEmailContainerProps) {
  const canvasWidth = useUIStore((s) => s.canvasWidth);
  const setCanvasWidth = useUIStore((s) => s.setCanvasWidth);
  const document = useEditorStore((s) => s.document);
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);

  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const commitWidth = useCallback(
    (width: number) => {
      const clamped = Math.round(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width)));
      setCanvasWidth(clamped);
      if (document.type === "mj-body") {
        updateNodeProps(document.id, { width: `${clamped}px` });
      }
    },
    [setCanvasWidth, document.id, document.type, updateNodeProps]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      dragRef.current = { startX: e.clientX, startWidth: canvasWidth };

      const handleMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        // Horizontal drag: moving right = wider, left = narrower
        // Multiply by 2 because container is centered (each pixel moves both edges)
        const delta = (ev.clientX - dragRef.current.startX) * 2;
        commitWidth(dragRef.current.startWidth + delta);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        dragRef.current = null;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [canvasWidth, commitWidth]
  );

  return (
    <div className="relative flex-1 overflow-auto" onClick={onClick}>
      <div className="min-h-full flex justify-center py-12">
        <div style={{ width: `${canvasWidth + 50}px`, maxWidth: "100%" }}>
          <div className="px-8" onClick={onClick}>
            {children}
          </div>
        </div>
      </div>

      {/* Fixed bottom-left width indicator */}
      <div className="sticky bottom-3 left-0 ml-3 w-fit z-10">
        <div
          className={cn(
            "group/handle inline-flex items-center gap-1 cursor-ew-resize select-none",
            "px-2 py-1 rounded-full transition-all duration-150",
            isDragging
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted"
          )}
          onMouseDown={handleMouseDown}
          title="Drag to resize width"
        >
          <GripHorizontal
            className={cn(
              "w-3 h-3 transition-opacity duration-150",
              isDragging ? "opacity-100" : "opacity-0 group-hover/handle:opacity-100"
            )}
          />
          <span className="text-[11px] tabular-nums leading-none">W: {canvasWidth}</span>
          <GripHorizontal
            className={cn(
              "w-3 h-3 transition-opacity duration-150",
              isDragging ? "opacity-100" : "opacity-0 group-hover/handle:opacity-100"
            )}
          />
        </div>
      </div>
    </div>
  );
}
