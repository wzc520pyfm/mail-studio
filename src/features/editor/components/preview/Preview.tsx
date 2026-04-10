/**
 * Preview - Email preview component with desktop/mobile views
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Eye, Code2, Copy, Check, Loader2, Monitor, Smartphone } from "lucide-react";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { compileDocument } from "@/features/editor/lib/mjml";
import { renderMarkdownPreview } from "@/features/editor/lib/markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

loader.config({ monaco });

export function Preview() {
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);
  const previewMode = useUIStore((s) => s.previewMode);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);
  const editorMode = useUIStore((s) => s.editorMode);
  const codeLanguage = useUIStore((s) => s.codeLanguage);
  const markdownBuffer = useUIStore((s) => s.markdownBuffer);

  const [viewTab, setViewTab] = useState<"rendered" | "html">("rendered");
  const [copied, setCopied] = useState(false);

  // Markdown preview with debounce
  const [markdownHtml, setMarkdownHtml] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isMarkdownMode = editorMode === "code" && codeLanguage === "markdown";

  useEffect(() => {
    if (!isMarkdownMode) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        const result = renderMarkdownPreview(markdownBuffer);
        setMarkdownHtml(result.html);
      } catch {
        // keep previous output on error
      }
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [markdownBuffer, isMarkdownMode]);

  // Compile MJML to HTML using useMemo (derived state)
  const { compiledHtml, errors } = useMemo(() => {
    const { html, errors: compileErrors } = compileDocument(document, headSettings);
    return { compiledHtml: html, errors: compileErrors };
  }, [document, headSettings]);

  // Use markdown preview HTML when in markdown mode, otherwise compiled MJML HTML
  const previewHtml = isMarkdownMode ? markdownHtml : compiledHtml;

  const handleCopyHtml = useCallback(async () => {
    await navigator.clipboard.writeText(previewHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [previewHtml]);

  const disableResponsive = headSettings.disableResponsive ?? false;
  // When disableResponsive + mobile: render at 600px and scale down to simulate real client behavior
  const scaleMobile = disableResponsive && previewMode === "mobile";
  const mobileWidth = 375;
  const emailWidth = 600;
  const scaleRatio = mobileWidth / emailWidth; // 0.625

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

          <div className="flex items-center gap-1.5">
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

            {viewTab === "rendered" && (
              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                <button
                  className={cn(
                    "flex items-center justify-center w-7 h-6 rounded transition-colors",
                    previewMode === "desktop"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setPreviewMode("desktop")}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  className={cn(
                    "flex items-center justify-center w-7 h-6 rounded transition-colors",
                    previewMode === "mobile"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setPreviewMode("mobile")}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Banner — hide in markdown mode since emailmd handles its own errors */}
      {!isMarkdownMode && errors.length > 0 && (
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
            value={previewHtml}
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
              <div
                style={
                  scaleMobile
                    ? {
                        width: `${mobileWidth}px`,
                        height: "600px",
                        overflow: "hidden",
                      }
                    : undefined
                }
              >
                <iframe
                  srcDoc={previewHtml}
                  className="border-0"
                  style={
                    scaleMobile
                      ? {
                          width: `${emailWidth}px`,
                          height: `${600 / scaleRatio}px`,
                          transform: `scale(${scaleRatio})`,
                          transformOrigin: "top left",
                        }
                      : {
                          width: "100%",
                          height: previewMode === "mobile" ? "600px" : "800px",
                        }
                  }
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>

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
