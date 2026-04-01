/**
 * ConvertMarkdownDialog Component
 * Confirmation dialog for converting Markdown to EditorNode document.
 * Warns user that this is a one-way operation that replaces the current document.
 */

"use client";

import { useState } from "react";
import { AlertTriangle, ArrowRightFromLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEditorStore, useUIStore } from "@/features/editor/stores";
import { markdownToDocument } from "@/features/editor/lib/markdown";

interface ConvertMarkdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConvertMarkdownDialog({ open, onOpenChange }: ConvertMarkdownDialogProps) {
  const markdownBuffer = useUIStore((s) => s.markdownBuffer);
  const setCodeLanguage = useUIStore((s) => s.setCodeLanguage);
  const setLastMarkdownConvertTime = useUIStore((s) => s.setLastMarkdownConvertTime);
  const setDocument = useEditorStore((s) => s.setDocument);
  const updateHeadSettings = useEditorStore((s) => s.updateHeadSettings);
  const setThemeVars = useEditorStore((s) => s.setThemeVars);

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = () => {
    setIsConverting(true);
    setError(null);

    try {
      const { document, headSettings, themeVars } = markdownToDocument(markdownBuffer);
      setDocument(document);
      updateHeadSettings(headSettings);
      setThemeVars(themeVars);
      setLastMarkdownConvertTime(Date.now());
      setCodeLanguage("mjml");
      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightFromLine className="w-5 h-5 text-blue-500" />
            Convert Markdown to Editor
          </DialogTitle>
          <DialogDescription>
            This will convert your Markdown content into MJML components and load them into the
            visual editor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-600/80 space-y-1">
            <p className="font-medium text-amber-600">
              This operation will replace your current document
            </p>
            <p>
              The current visual editor content will be overwritten. This action cannot be undone
              via the Markdown editor. You can still use Undo in the visual editor after conversion.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isConverting}>
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={isConverting}>
            {isConverting ? "Converting..." : "Convert & Switch to MJML"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
