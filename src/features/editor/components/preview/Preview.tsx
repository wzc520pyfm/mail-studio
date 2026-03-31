/**
 * Preview - Email preview component with desktop/mobile views
 */

"use client";

import { useCallback, useMemo, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Eye, Code2, Copy, Check, Loader2 } from "lucide-react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { compileDocument } from "@/features/editor/lib/mjml";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

loader.config({ monaco });

export function Preview() {
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);
  const previewMode = useUIStore((s) => s.previewMode);
  const editorMode = useUIStore((s) => s.editorMode);

  const [viewTab, setViewTab] = useState<"rendered" | "html">("rendered");
  const [copied, setCopied] = useState(false);

  // Compile MJML to HTML using useMemo (derived state)
  const { compiledHtml, errors } = useMemo(() => {
    const { html, errors: compileErrors } = compileDocument(document, headSettings);
    return { compiledHtml: html, errors: compileErrors };
  }, [document, headSettings]);

  const handleCopyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(compiledHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [compiledHtml]);

  const frameWidth = previewMode === "desktop" ? "100%" : "375px";
  const frameMaxWidth = previewMode === "desktop" ? "800px" : "375px";

  const showToggle = editorMode === "code";

  return (
    <div className="h-full bg-muted/50 flex flex-col">
      {/* Tab Bar - only in Code mode */}
      {showToggle && (
        <div className="flex items-center justify-between border-b border-border bg-background px-2 py-1">
          <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
            <button
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                viewTab === "rendered"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewTab("rendered")}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                viewTab === "html"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setViewTab("html")}
            >
              <Code2 className="w-3.5 h-3.5" />
              HTML
            </button>
          </div>

          {viewTab === "html" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1.5"
              onClick={handleCopyHtml}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Error Banner */}
      {errors.length > 0 && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
          <p className="text-sm text-destructive">
            {errors.length} compilation error{errors.length > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* HTML Source View */}
      {showToggle && viewTab === "html" ? (
        <div className="flex-1">
          <Editor
            height="100%"
            language="html"
            theme="vs-dark"
            value={compiledHtml}
            loading={
              <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            }
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              folding: true,
              automaticLayout: true,
            }}
          />
        </div>
      ) : (
        /* Preview Frame */
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
      )}
    </div>
  );
}
