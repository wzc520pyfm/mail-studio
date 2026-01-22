/**
 * Code Editor - Monaco-based MJML source code editor
 *
 * A full-featured MJML code editor with:
 * - Syntax highlighting for MJML
 * - Locked region protection (data-locked="true")
 * - Live preview synchronization
 * - Error handling and validation
 */

"use client";

import { useCallback, useEffect } from "react";
import Editor, { OnMount, BeforeMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";

import { useCodeSync, useLockedRegions } from "./hooks";
import { CodeEditorToolbar, CodeEditorBanners } from "./components";
import { initializeMonacoForMjml, defaultEditorOptions } from "./utils";

export function CodeEditor() {
  // Code synchronization state and actions
  const { code, isDirty, error, handleChange, handleSync, handleReset } = useCodeSync();

  // Locked regions management
  const { lockedWarning, setupLockedRegions, updateDecorations } = useLockedRegions();

  // Update decorations when code changes
  useEffect(() => {
    if (code) {
      // Small delay to ensure model is updated
      const timer = setTimeout(() => {
        updateDecorations();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [code, updateDecorations]);

  // Handle Monaco editor mount
  const handleEditorMount: OnMount = useCallback(
    (editor, monaco) => {
      // Setup locked regions protection
      setupLockedRegions(editor, monaco);

      // Focus editor when mounted
      editor.focus();
    },
    [setupLockedRegions]
  );

  // Handle Monaco before mount - register language and theme
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    initializeMonacoForMjml(monaco);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <CodeEditorToolbar isDirty={isDirty} onReset={handleReset} onSync={handleSync} />

      {/* Error and Warning Banners */}
      <CodeEditorBanners error={error} lockedWarning={lockedWarning} />

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="mjml"
          theme="mjml-dark"
          value={code}
          onChange={handleChange}
          onMount={handleEditorMount}
          beforeMount={handleBeforeMount}
          loading={
            <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          }
          options={defaultEditorOptions}
        />
      </div>
    </div>
  );
}
