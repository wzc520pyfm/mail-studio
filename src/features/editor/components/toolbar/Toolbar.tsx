/**
 * Toolbar component with view controls and actions
 */

"use client";

import { memo, useCallback, useRef } from "react";
import {
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Code2,
  Eye,
  Download,
  Upload,
  Copy,
  FileJson,
  FileCode,
  LayoutGrid,
  PenLine,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore, useUIStore, useUndoRedo } from "@/features/editor/stores";
import {
  compileDocument,
  generateMjml,
  parseMjml,
  parseHtmlToMjml,
} from "@/features/editor/lib/mjml/compiler";
import { HeadSettingsButton } from "./HeadSettingsButton";
import { SendEmailDialog } from "./SendEmailDialog";

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const Toolbar = memo(function Toolbar() {
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);
  const setDocument = useEditorStore((s) => s.setDocument);
  const updateHeadSettings = useEditorStore((s) => s.updateHeadSettings);
  const editorMode = useUIStore((s) => s.editorMode);
  const previewMode = useUIStore((s) => s.previewMode);
  const setEditorMode = useUIStore((s) => s.setEditorMode);
  const setPreviewMode = useUIStore((s) => s.setPreviewMode);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importTypeRef = useRef<"mjml" | "html">("mjml");

  const handleUndo = useCallback(() => {
    if (canUndo) undo();
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) redo();
  }, [canRedo, redo]);

  const handleExportMjml = useCallback(() => {
    const mjml = generateMjml(document, headSettings);
    downloadFile(mjml, "email.mjml", "text/plain");
  }, [document, headSettings]);

  const handleExportHtml = useCallback(() => {
    const { html } = compileDocument(document, headSettings);
    downloadFile(html, "email.html", "text/html");
  }, [document, headSettings]);

  const handleCopyMjml = useCallback(async () => {
    const mjml = generateMjml(document, headSettings);
    await navigator.clipboard.writeText(mjml);
  }, [document, headSettings]);

  const handleCopyHtml = useCallback(async () => {
    const { html } = compileDocument(document, headSettings);
    await navigator.clipboard.writeText(html);
  }, [document, headSettings]);

  const handleImportMjml = useCallback(() => {
    importTypeRef.current = "mjml";
    fileInputRef.current?.click();
  }, []);

  const handleImportHtml = useCallback(() => {
    importTypeRef.current = "html";
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) return;

        let result;
        if (importTypeRef.current === "mjml") {
          result = parseMjml(content);
        } else {
          result = parseHtmlToMjml(content);
        }

        if (result.document) {
          setDocument(result.document);
          // Update head settings if any were parsed
          if (result.headSettings) {
            updateHeadSettings(result.headSettings);
          }

          // Show any warnings/info
          if (result.errors.length > 0) {
            // Use a simple alert for now, could be improved with a toast
            alert(result.errors.join("\n"));
          }
        } else {
          alert(`Import failed:\n${result.errors.join("\n")}`);
        }
      };
      reader.readAsText(file);

      // Reset file input so the same file can be imported again
      event.target.value = "";
    },
    [setDocument, updateHeadSettings]
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-12 md:h-14 border-b border-border bg-background px-2 md:px-4 flex items-center justify-between gap-1 md:gap-2">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-foreground flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                className="w-3.5 h-3.5 md:w-4 md:h-4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6L10 12L17 6"
                  className="stroke-background"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="font-semibold text-base md:text-lg hidden md:inline">Mail Studio</span>
          </div>
        </div>

        {/* Center Section - View Controls */}
        <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "canvas" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 md:h-8 w-7 md:w-auto md:px-3"
                onClick={() => setEditorMode("canvas")}
              >
                <LayoutGrid className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline text-xs">Canvas</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visual block editor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "edit" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 md:h-8 w-7 md:w-auto md:px-3"
                onClick={() => setEditorMode("edit")}
              >
                <PenLine className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline text-xs">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Text editing mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 md:h-8 w-7 md:w-auto md:px-3"
                onClick={() => setEditorMode("preview")}
              >
                <Eye className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline text-xs">Preview</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview rendered email</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "code" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 md:h-8 w-7 md:w-auto md:px-3"
                onClick={() => setEditorMode("code")}
              >
                <Code2 className="w-4 h-4 md:mr-1.5" />
                <span className="hidden md:inline text-xs">Code</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>MJML source code</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-0.5 md:gap-1.5 flex-shrink-0">
          {/* Device Toggle (only in preview) */}
          {editorMode === "preview" && (
            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={previewMode === "desktop" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode("desktop")}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Desktop View</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={previewMode === "mobile" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPreviewMode("mobile")}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mobile View</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Undo/Redo - Always visible */}
          <div className="flex items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (⌘Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
            </Tooltip>
          </div>

          {/* Head Settings */}
          <HeadSettingsButton />

          {/* Send Email - Always visible */}
          <SendEmailDialog />

          {/* More Menu for mobile - contains import/export options */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-7 w-7 md:hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>More options</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                <Upload className="w-3 h-3 inline mr-1.5" />
                Import
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleImportMjml}>
                <FileJson className="w-4 h-4 mr-2" />
                Import MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportHtml}>
                <FileCode className="w-4 h-4 mr-2" />
                Import HTML
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Beta
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-muted-foreground">
                <Download className="w-3 h-3 inline mr-1.5" />
                Export
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleCopyMjml}>
                <Copy className="w-4 h-4 mr-2" />
                Copy MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyHtml}>
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMjml}>
                <FileJson className="w-4 h-4 mr-2" />
                Download MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportHtml}>
                <FileCode className="w-4 h-4 mr-2" />
                Download HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* File Menu - Tablet and Desktop */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden md:flex h-8 px-3">
                    <FolderOpen className="w-4 h-4 mr-1.5" />
                    <span className="text-xs">File</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Import & Export</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                <Upload className="w-3 h-3 inline mr-1.5" />
                Import
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleImportMjml}>
                <FileJson className="w-4 h-4 mr-2" />
                Import MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportHtml}>
                <FileCode className="w-4 h-4 mr-2" />
                Import HTML
                <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Beta
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs text-muted-foreground">
                <Download className="w-3 h-3 inline mr-1.5" />
                Export
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={handleCopyMjml}>
                <Copy className="w-4 h-4 mr-2" />
                Copy MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyHtml}>
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMjml}>
                <FileJson className="w-4 h-4 mr-2" />
                Download MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportHtml}>
                <FileCode className="w-4 h-4 mr-2" />
                Download HTML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Hidden file input for imports */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".mjml,.html,.htm"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </TooltipProvider>
  );
});
