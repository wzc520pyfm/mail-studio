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

import { useCallback, useEffect, useRef } from "react";
import Editor, { loader, OnMount, BeforeMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import * as monaco from "monaco-editor";

import { useCodeSync, useLockedRegions } from "./hooks";
import { CodeEditorToolbar, CodeEditorBanners } from "./components";
import { initializeMonacoForMjml, defaultEditorOptions } from "./utils";

// 配置 Monaco Editor 使用本地资源，避免请求 CDN
loader.config({ monaco });

export function CodeEditor() {
  // Code synchronization state and actions
  const { code, isDirty, error, compileErrors, handleChange, handleSync, handleReset } =
    useCodeSync();

  // Refs for Monaco editor and monaco instance (for setting markers)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);

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

  // Set Monaco model markers when compilation errors change
  useEffect(() => {
    const editor = editorRef.current;
    const monacoInstance = monacoRef.current;
    if (!editor || !monacoInstance) return;

    const model = editor.getModel();
    if (!model) return;

    const markers: monaco.editor.IMarkerData[] = compileErrors.map((err) => {
      const line = err.line > 0 ? err.line : 1;
      return {
        severity: monacoInstance.MarkerSeverity.Error,
        message: err.formattedMessage || err.message,
        startLineNumber: line,
        startColumn: 1,
        endLineNumber: line,
        endColumn: model.getLineMaxColumn(line),
      };
    });

    monacoInstance.editor.setModelMarkers(model, "mjml", markers);
  }, [compileErrors]);

  // Handle Monaco editor mount
  const handleEditorMount: OnMount = useCallback(
    (editor, monacoInstance) => {
      // Store refs for marker updates
      editorRef.current = editor;
      monacoRef.current = monacoInstance;

      // Setup locked regions protection
      setupLockedRegions(editor, monacoInstance);

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
      <CodeEditorBanners
        error={error}
        lockedWarning={lockedWarning}
        compileErrorCount={compileErrors.length}
      />

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
