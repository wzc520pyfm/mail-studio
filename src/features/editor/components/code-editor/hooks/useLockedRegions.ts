/**
 * useLockedRegions Hook
 * Manages locked region decorations and edit interception in Monaco editor
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { editor } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";
import type { LockedRegion } from "../types";
import { findLockedRegions, isRangeInLockedRegion } from "../utils";

interface UseLockedRegionsResult {
  /** Warning message when trying to edit locked region */
  lockedWarning: string | null;
  /** Callback to set up locked regions on editor mount */
  setupLockedRegions: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  /** Update decorations when code changes */
  updateDecorations: () => void;
}

/**
 * Hook for managing locked regions in the code editor
 * - Finds and highlights locked regions
 * - Prevents editing in locked regions
 * - Shows warning when edit is blocked
 */
export function useLockedRegions(): UseLockedRegionsResult {
  const [lockedWarning, setLockedWarning] = useState<string | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const lockedRegionsRef = useRef<LockedRegion[]>([]);

  // Clear warning after timeout
  const showWarning = useCallback((message: string) => {
    setLockedWarning(message);
    setTimeout(() => setLockedWarning(null), 2000);
  }, []);

  // Update locked region decorations
  const updateDecorations = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const currentCode = model.getValue();
    const regions = findLockedRegions(currentCode);
    lockedRegionsRef.current = regions;

    // Create decorations for locked regions
    const decorations: editor.IModelDeltaDecoration[] = regions.map((region) => ({
      range: {
        startLineNumber: region.startLine,
        startColumn: 1,
        endLineNumber: region.endLine,
        endColumn: model.getLineMaxColumn(region.endLine),
      },
      options: {
        isWholeLine: true,
        className: "locked-region-line",
        glyphMarginClassName: "locked-region-glyph",
        glyphMarginHoverMessage: { value: "🔒 This region is locked and cannot be edited" },
        overviewRuler: {
          color: "#f59e0b",
          position: 4, // Right
        },
        minimap: {
          color: "#f59e0b",
          position: 1, // Inline
        },
      },
    }));

    // Update decorations
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
  }, []);

  // Setup locked regions on editor mount
  const setupLockedRegions = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
      editorRef.current = editor;

      // Initial decoration update
      updateDecorations();

      // Listen for content changes to update decorations
      const model = editor.getModel();
      if (model) {
        model.onDidChangeContent(() => {
          // Debounce decoration updates
          setTimeout(updateDecorations, 100);
        });
      }

      // Override the editor's executeEdits to intercept edits to locked regions
      const originalExecuteEdits = editor.executeEdits.bind(editor);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor as any).executeEdits = (
        source: string | null | undefined,
        edits: editor.IIdentifiedSingleEditOperation[],
        endCursorState?: unknown
      ) => {
        const lockedRegions = lockedRegionsRef.current;

        // Check if any edit touches a locked region
        const hasLockedEdit = edits.some((edit) => {
          if (!edit.range) return false;
          return isRangeInLockedRegion(edit.range, lockedRegions);
        });

        if (hasLockedEdit) {
          showWarning("Cannot edit locked region");
          return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return originalExecuteEdits(source, edits, endCursorState as any);
      };

      // Intercept keyboard-based edits
      editor.onKeyDown((e) => {
        const selection = editor.getSelection();
        if (!selection) return;

        const lockedRegions = lockedRegionsRef.current;
        const isInLocked = isRangeInLockedRegion(selection, lockedRegions);

        if (isInLocked) {
          // Allow navigation keys
          const allowedKeys = [
            monaco.KeyCode.LeftArrow,
            monaco.KeyCode.RightArrow,
            monaco.KeyCode.UpArrow,
            monaco.KeyCode.DownArrow,
            monaco.KeyCode.Home,
            monaco.KeyCode.End,
            monaco.KeyCode.PageUp,
            monaco.KeyCode.PageDown,
            monaco.KeyCode.Escape,
          ];

          const isNavigation = allowedKeys.includes(e.keyCode);
          const isCtrlCmd = e.ctrlKey || e.metaKey;
          const isCopy = isCtrlCmd && e.keyCode === monaco.KeyCode.KeyC;
          const isSelectAll = isCtrlCmd && e.keyCode === monaco.KeyCode.KeyA;

          // Allow navigation, copy, and select all
          if (!isNavigation && !isCopy && !isSelectAll) {
            // Block editing keys
            const editingKeys = [
              monaco.KeyCode.Backspace,
              monaco.KeyCode.Delete,
              monaco.KeyCode.Enter,
              monaco.KeyCode.Tab,
            ];

            // If it's an editing key or a character key, prevent it
            if (
              editingKeys.includes(e.keyCode) ||
              (!isCtrlCmd &&
                !e.altKey &&
                e.keyCode >= monaco.KeyCode.KeyA &&
                e.keyCode <= monaco.KeyCode.KeyZ)
            ) {
              e.preventDefault();
              e.stopPropagation();
              showWarning("Cannot edit locked region");
            }
          }
        }
      });

      // Intercept paste operations
      editor.onDidPaste(() => {
        const selection = editor.getSelection();
        if (!selection) return;

        const lockedRegions = lockedRegionsRef.current;
        if (isRangeInLockedRegion(selection, lockedRegions)) {
          // Undo the paste operation
          editor.trigger("locked-region", "undo", null);
          showWarning("Cannot paste in locked region");
        }
      });
    },
    [updateDecorations, showWarning]
  );

  return {
    lockedWarning,
    setupLockedRegions,
    updateDecorations,
  };
}
