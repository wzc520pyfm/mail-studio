/**
 * CodeEditorToolbar Component
 * Toolbar with sync/reset actions for the code editor
 */

import { Button } from "@/components/ui/button";
import { RefreshCw, Check } from "lucide-react";
import type { CodeEditorToolbarProps } from "../types";

export function CodeEditorToolbar({ isDirty, onReset, onSync }: CodeEditorToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3c3c3c]">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">MJML Source</span>
        {isDirty && (
          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">
            Modified
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isDirty && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-gray-400 hover:text-white hover:bg-[#3c3c3c]"
              onClick={onReset}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-green-400 hover:text-green-300 hover:bg-green-500/20"
              onClick={onSync}
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Apply Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
