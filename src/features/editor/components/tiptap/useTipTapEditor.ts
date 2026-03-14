"use client";

import { useEffect, useRef } from "react";
import { useEditor } from "@tiptap/react";
import type { Extensions, Editor } from "@tiptap/react";

interface UseTipTapEditorOptions {
  content: string;
  extensions: Extensions;
  editable?: boolean;
  onUpdate?: (html: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function useTipTapEditor({
  content,
  extensions,
  editable = true,
  onUpdate,
  onFocus,
  onBlur,
}: UseTipTapEditorOptions): Editor | null {
  const onUpdateRef = useRef(onUpdate);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onFocusRef.current = onFocus;
    onBlurRef.current = onBlur;
  });

  const editor = useEditor({
    extensions,
    content,
    editable,
    onUpdate: ({ editor }) => {
      onUpdateRef.current?.(editor.getHTML());
    },
    onFocus: () => {
      onFocusRef.current?.();
    },
    onBlur: () => {
      onBlurRef.current?.();
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor outline-none",
      },
    },
    immediatelyRender: false,
  });

  // Sync editable state
  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  // Sync content from external changes only when editor is not focused
  useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  return editor;
}

export function useTableTipTapEditor({
  content,
  extensions,
  editable = true,
  onUpdate,
  onFocus,
  onBlur,
}: UseTipTapEditorOptions): Editor | null {
  const onUpdateRef = useRef(onUpdate);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onFocusRef.current = onFocus;
    onBlurRef.current = onBlur;
  });

  const wrappedContent = wrapTableContent(content);

  const editor = useEditor({
    extensions,
    content: wrappedContent,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const rows = extractTableRows(html);
      onUpdateRef.current?.(rows);
    },
    onFocus: () => {
      onFocusRef.current?.();
    },
    onBlur: () => {
      onBlurRef.current?.();
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor tiptap-table-editor outline-none",
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable);
    }
  }, [editor, editable]);

  useEffect(() => {
    if (editor && !editor.isFocused) {
      const newWrapped = wrapTableContent(content);
      if (newWrapped !== editor.getHTML()) {
        editor.commands.setContent(newWrapped, { emitUpdate: false });
      }
    }
  }, [editor, content]);

  return editor;
}

function wrapTableContent(rowsHtml: string): string {
  if (!rowsHtml || !rowsHtml.trim()) {
    return "<table><tbody><tr><th>Header 1</th><th>Header 2</th></tr><tr><td>Cell 1</td><td>Cell 2</td></tr></tbody></table>";
  }
  return `<table><tbody>${rowsHtml}</tbody></table>`;
}

function extractTableRows(fullHtml: string): string {
  const temp = document.createElement("div");
  temp.innerHTML = fullHtml;
  const tbody = temp.querySelector("tbody");
  if (tbody) {
    return tbody.innerHTML;
  }
  const table = temp.querySelector("table");
  if (table) {
    return table.innerHTML;
  }
  return fullHtml;
}
