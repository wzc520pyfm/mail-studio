'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Mail,
} from 'lucide-react';
import { useEditorStore, useTemporalStore } from '@/stores/editor';
import { useUIStore } from '@/stores/ui';
import { compileDocument, generateMjml } from '@/lib/mjml/compiler';
import { useCallback } from 'react';

export function Toolbar() {
  const document = useEditorStore((s) => s.document);
  const { undo, redo, pastStates, futureStates } = useTemporalStore().getState();
  const {
    previewMode,
    showCode,
    showPreview,
    setPreviewMode,
    setShowCode,
    setShowPreview,
  } = useUIStore();

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleUndo = useCallback(() => {
    if (canUndo) undo();
  }, [canUndo, undo]);

  const handleRedo = useCallback(() => {
    if (canRedo) redo();
  }, [canRedo, redo]);

  const handleExportMjml = useCallback(() => {
    const mjml = generateMjml(document);
    downloadFile(mjml, 'email.mjml', 'text/plain');
  }, [document]);

  const handleExportHtml = useCallback(() => {
    const { html } = compileDocument(document);
    downloadFile(html, 'email.html', 'text/html');
  }, [document]);

  const handleCopyMjml = useCallback(async () => {
    const mjml = generateMjml(document);
    await navigator.clipboard.writeText(mjml);
  }, [document]);

  const handleCopyHtml = useCallback(async () => {
    const { html } = compileDocument(document);
    await navigator.clipboard.writeText(html);
  }, [document]);

  const handleViewCanvas = useCallback(() => {
    setShowCode(false);
    setShowPreview(false);
  }, [setShowCode, setShowPreview]);

  const handleViewPreview = useCallback(() => {
    setShowCode(false);
    setShowPreview(true);
  }, [setShowCode, setShowPreview]);

  const handleViewCode = useCallback(() => {
    setShowCode(true);
    setShowPreview(false);
  }, [setShowCode, setShowPreview]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-14 border-b border-border bg-background px-4 flex items-center justify-between">
        {/* Left Section - Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg">Mail Studio</span>
          </div>
        </div>

        {/* Center Section - View Controls */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={!showCode && !showPreview ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={handleViewCanvas}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Canvas
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showPreview && !showCode ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={handleViewPreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview Mode</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showCode ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-3"
                onClick={handleViewCode}
              >
                <Code2 className="w-4 h-4 mr-2" />
                Code
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Editor</TooltipContent>
          </Tooltip>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Device Toggle (only in preview) */}
          {showPreview && !showCode && (
            <>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop View</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPreviewMode('mobile')}
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
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
