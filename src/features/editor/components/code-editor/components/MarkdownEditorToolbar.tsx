/**
 * MarkdownEditorToolbar Component
 * Toolbar for the Markdown code editor with convert action
 */

import { ArrowRightFromLine, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/features/editor/stores";

export function MarkdownEditorToolbar() {
  const lastMarkdownConvertTime = useUIStore((s) => s.lastMarkdownConvertTime);

  return (
    <div className="flex flex-col bg-[#252526] border-b border-[#3c3c3c]">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Markdown Source</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
            onClick={() => {
              // This will be handled by the parent — dispatch a custom event
              window.dispatchEvent(new CustomEvent("markdown-convert-request"));
            }}
          >
            <ArrowRightFromLine className="w-3.5 h-3.5 mr-1.5" />
            Convert to Editor
          </Button>
        </div>
      </div>

      {/* Conversion info banner */}
      <div className="flex items-center gap-1.5 px-4 py-1 bg-[#1e1e1e]/50 border-t border-[#3c3c3c] text-[11px] text-gray-500">
        <Info className="w-3 h-3 shrink-0" />
        {lastMarkdownConvertTime ? (
          <span>
            Last converted at {new Date(lastMarkdownConvertTime).toLocaleTimeString()} — visual
            editor may have been modified since then
          </span>
        ) : (
          <span>Markdown will replace the current document when converted</span>
        )}
      </div>
    </div>
  );
}
