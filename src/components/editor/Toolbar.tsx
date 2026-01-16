"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Undo2,
  Redo2,
  Monitor,
  Smartphone,
  Code2,
  Eye,
  Download,
  Copy,
  FileJson,
  FileCode,
  LayoutGrid,
  PenLine,
} from "lucide-react";
import { useEditorStore, useTemporalStore } from "@/stores/editor";
import { useUIStore } from "@/stores/ui";
import { compileDocument, generateMjml } from "@/lib/mjml/compiler";
import { useCallback } from "react";
import { HeadSettingsButton } from "./HeadSettings";

export function Toolbar() {
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);
  const { undo, redo, pastStates, futureStates } =
    useTemporalStore().getState();
  const { editorMode, previewMode, setEditorMode, setPreviewMode } =
    useUIStore();

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-14 border-b border-border bg-background px-4 flex items-center justify-between">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                className="w-4 h-4"
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
            <span className="font-semibold text-lg">Mail Studio</span>
          </div>
        </div>

        {/* Center Section - View Controls */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "canvas" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setEditorMode("canvas")}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Canvas
              </Button>
            </TooltipTrigger>
            <TooltipContent>Visual block editor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "edit" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setEditorMode("edit")}
              >
                <PenLine className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent>Text editing mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setEditorMode("preview")}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview rendered email</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editorMode === "code" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3"
                onClick={() => setEditorMode("code")}
              >
                <Code2 className="w-4 h-4 mr-2" />
                Code
              </Button>
            </TooltipTrigger>
            <TooltipContent>MJML source code</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Device Toggle (only in preview) */}
          {editorMode === "preview" && (
            <>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={
                        previewMode === "desktop" ? "secondary" : "ghost"
                      }
                      size="icon"
                      className="h-8 w-8"
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
                      className="h-8 w-8"
                      onClick={() => setPreviewMode("mobile")}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile View</TooltipContent>
                </Tooltip>
              </div>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
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
                  className="h-8 w-8"
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Head Settings */}
          <HeadSettingsButton />

          {/* Export */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Export Email</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyMjml}>
                <Copy className="w-4 h-4 mr-2" />
                Copy MJML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyHtml}>
                <Copy className="w-4 h-4 mr-2" />
                Copy HTML
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
        </div>
      </div>
    </TooltipProvider>
  );
}

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
