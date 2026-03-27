/**
 * CanvasWidthControl - Slider control for adjusting the email canvas width
 */

"use client";

import { memo, useCallback } from "react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { Slider } from "@/components/ui/slider";
import { Github, Monitor, Smartphone } from "lucide-react";

const MIN_WIDTH = 320;
const MAX_WIDTH = 960;

export const CanvasWidthControl = memo(function CanvasWidthControl() {
  const canvasWidth = useUIStore((s) => s.canvasWidth);
  const setCanvasWidth = useUIStore((s) => s.setCanvasWidth);
  const document = useEditorStore((s) => s.document);
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);

  const updateWidth = useCallback(
    (width: number) => {
      setCanvasWidth(width);
      // Sync mj-body width prop so Preview/Code modes reflect the change
      if (document.type === "mj-body") {
        updateNodeProps(document.id, { width: `${width}px` });
      }
    },
    [setCanvasWidth, document.id, document.type, updateNodeProps]
  );

  const handleSliderChange = useCallback(
    (value: number[]) => {
      updateWidth(value[0]);
    },
    [updateWidth]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        updateWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, val)));
      }
    },
    [updateWidth]
  );

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-sm border-t border-border">
      <Smartphone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <Slider
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        step={10}
        value={[canvasWidth]}
        onValueChange={handleSliderChange}
        className="flex-1 max-w-[200px]"
      />
      <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <input
        type="number"
        min={MIN_WIDTH}
        max={MAX_WIDTH}
        value={canvasWidth}
        onChange={handleInputChange}
        className="w-16 text-xs text-center border border-border rounded px-1.5 py-1 bg-background text-foreground tabular-nums"
      />
      <span className="text-xs text-muted-foreground">px</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* GitHub link */}
      <a
        href="https://github.com/wzc520pyfm/mail-studio"
        target="_blank"
        rel="noopener noreferrer"
        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
        title="View on GitHub"
      >
        <Github className="w-4 h-4" />
      </a>
    </div>
  );
});
