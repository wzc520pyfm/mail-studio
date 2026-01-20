/**
 * Preview - Email preview component with desktop/mobile views
 */

"use client";

import { useMemo } from "react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { compileDocument } from "@/features/editor/lib/mjml";
import { cn } from "@/lib/utils";

export function Preview() {
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);
  const previewMode = useUIStore((s) => s.previewMode);

  // Compile MJML to HTML using useMemo (derived state)
  const { compiledHtml, errors } = useMemo(() => {
    const { html, errors: compileErrors } = compileDocument(document, headSettings);
    return { compiledHtml: html, errors: compileErrors };
  }, [document, headSettings]);

  const frameWidth = previewMode === "desktop" ? "100%" : "375px";
  const frameMaxWidth = previewMode === "desktop" ? "800px" : "375px";

  return (
    <div className="h-full bg-muted/50 flex flex-col">
      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
          <p className="text-sm text-destructive">
            {errors.length} compilation error{errors.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full flex items-start justify-center p-4 sm:p-6 lg:p-8">
          <div
            className={cn(
              "bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 w-full",
              previewMode === "mobile" && "border-8 border-gray-800 rounded-[2rem] w-auto"
            )}
            style={{
              width: previewMode === "mobile" ? frameWidth : "100%",
              maxWidth: frameMaxWidth,
            }}
          >
            {/* Mobile Notch */}
            {previewMode === "mobile" && (
              <div className="h-6 bg-gray-800 flex items-center justify-center">
                <div className="w-20 h-4 bg-black rounded-b-xl" />
              </div>
            )}

            {/* HTML Preview */}
            <iframe
              srcDoc={compiledHtml}
              className="w-full border-0"
              style={{
                height: previewMode === "mobile" ? "600px" : "800px",
              }}
              title="Email Preview"
              sandbox="allow-same-origin"
            />

            {/* Mobile Home Indicator */}
            {previewMode === "mobile" && (
              <div className="h-6 bg-gray-800 flex items-center justify-center">
                <div className="w-32 h-1 bg-white rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
