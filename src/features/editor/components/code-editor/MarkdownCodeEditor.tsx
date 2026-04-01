/**
 * Markdown Code Editor - Monaco-based Markdown editor with emailmd preview
 *
 * Provides a Markdown editing experience within the Code mode,
 * using emailmd to render live previews of the email output.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { loader, OnMount, BeforeMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import * as monaco from "monaco-editor";

import { useUIStore } from "@/features/editor/stores";
import { MarkdownEditorToolbar } from "./components";
import { ConvertMarkdownDialog } from "./components/ConvertMarkdownDialog";
import { defaultEditorOptions } from "./utils";

// Configure Monaco Editor to use local resources
loader.config({ monaco });

function initializeMonacoForMarkdown(monacoInstance: typeof monaco) {
  // Define markdown dark theme matching the MJML editor style
  if (!monacoInstance.editor.getModel) return;
  try {
    monacoInstance.editor.defineTheme("markdown-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1e1e1e",
      },
    });
  } catch {
    // Theme may already be defined
  }
}

export function MarkdownCodeEditor() {
  const markdownBuffer = useUIStore((s) => s.markdownBuffer);
  const setMarkdownBuffer = useUIStore((s) => s.setMarkdownBuffer);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // Listen for convert request from MarkdownEditorToolbar
  useEffect(() => {
    const handler = () => setConvertDialogOpen(true);
    window.addEventListener("markdown-convert-request", handler);
    return () => window.removeEventListener("markdown-convert-request", handler);
  }, []);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setMarkdownBuffer(value);
      }
    },
    [setMarkdownBuffer]
  );

  const handleEditorMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleBeforeMount: BeforeMount = useCallback((monacoInstance) => {
    initializeMonacoForMarkdown(monacoInstance);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <MarkdownEditorToolbar />

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language="markdown"
          theme="markdown-dark"
          value={markdownBuffer}
          onChange={handleChange}
          onMount={handleEditorMount}
          beforeMount={handleBeforeMount}
          loading={
            <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          }
          options={{
            ...defaultEditorOptions,
            glyphMargin: false,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Convert Confirmation Dialog */}
      <ConvertMarkdownDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen} />
    </div>
  );
}
