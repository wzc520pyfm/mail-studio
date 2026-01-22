/**
 * CodeEditorBanners Component
 * Error and warning banners for the code editor
 */

import { AlertCircle, Lock } from "lucide-react";
import type { CodeEditorBannersProps } from "../types";

export function CodeEditorBanners({ error, lockedWarning }: CodeEditorBannersProps) {
  return (
    <>
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-b border-red-500/30">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Locked Region Warning Banner */}
      {lockedWarning && (
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border-b border-yellow-500/30 animate-pulse">
          <Lock className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400">{lockedWarning}</span>
        </div>
      )}
    </>
  );
}
