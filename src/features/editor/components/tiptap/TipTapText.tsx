"use client";

import { useMemo, useCallback, useEffect, useState, useRef } from "react";
import { EditorContent, posToDOMRect } from "@tiptap/react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { useTipTapEditor } from "./useTipTapEditor";
import { getRichTextExtensions } from "./extensions";
import { TipTapToolbar } from "./TipTapToolbar";
import { SlashMenuPortal, setSlashCommandCallback } from "./SlashCommand";
import type { SlashCommandItem } from "./SlashCommand";

interface TipTapTextProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function TipTapText({ node, isLocked = false }: TipTapTextProps) {
  const { updateNodeContent, addNode, findParent } = useEditorStore();
  const [hasSelection, setHasSelection] = useState(false);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const isPopoverOpenRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const extensions = useMemo(
    () => getRichTextExtensions(undefined, { enableSlashCommands: !isLocked }),
    [isLocked]
  );

  const handleUpdate = useCallback(
    (html: string) => {
      updateNodeContent(node.id, html);
    },
    [node.id, updateNodeContent]
  );

  const editor = useTipTapEditor({
    content: node.content || "",
    extensions,
    editable: !isLocked,
    onUpdate: handleUpdate,
  });

  useEffect(() => {
    if (!editor) return;
    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      const selected = from !== to;
      setHasSelection(selected);
      if (selected) {
        const rect = posToDOMRect(editor.view, from, to);
        setToolbarPos({ top: rect.top - 48, left: rect.left + rect.width / 2 });
      }
    };
    editor.on("selectionUpdate", updateSelection);
    editor.on("blur", () => {
      if (!isPopoverOpenRef.current) {
        setTimeout(() => {
          if (!isPopoverOpenRef.current) {
            setHasSelection(false);
          }
        }, 200);
      }
    });
    return () => {
      editor.off("selectionUpdate", updateSelection);
    };
  }, [editor]);

  useEffect(() => {
    if (isLocked) return;
    const callback = (item: SlashCommandItem) => {
      const parentInfo = findParent(node.id);
      if (parentInfo) {
        const insertIndex = parentInfo.index + 1;
        addNode(parentInfo.parent.id, item.type, insertIndex);
      }
    };
    setSlashCommandCallback(callback);
    return () => setSlashCommandCallback(null);
  }, [node.id, findParent, addNode, isLocked]);

  const containerStyle = useMemo(
    () => ({
      backgroundColor: node.props["container-background-color"] as string,
      padding: (node.props["padding"] as string) || "10px 25px",
    }),
    [node.props]
  );

  const editorStyle = useMemo(
    () => ({
      fontSize: (node.props["font-size"] as string) || "13px",
      fontWeight: node.props["font-weight"] as string,
      fontFamily: node.props["font-family"] as string,
      fontStyle: node.props["font-style"] as string,
      color: (node.props["color"] as string) || "#000000",
      lineHeight: (node.props["line-height"] as string) || "1.5",
      letterSpacing: node.props["letter-spacing"] as string,
      textAlign: (node.props["align"] as "left" | "center" | "right") || "left",
      textDecoration: node.props["text-decoration"] as string,
      textTransform: node.props["text-transform"] as
        | "none"
        | "capitalize"
        | "uppercase"
        | "lowercase",
    }),
    [node.props]
  );

  if (!editor) return null;

  return (
    <div className="relative" ref={containerRef} style={containerStyle}>
      {!isLocked && hasSelection && toolbarPos && (
        <div
          className="fixed z-50"
          style={{ top: toolbarPos.top, left: toolbarPos.left, transform: "translateX(-50%)" }}
        >
          <TipTapToolbar
            editor={editor}
            onPopoverOpenChange={(open) => {
              isPopoverOpenRef.current = open;
            }}
          />
        </div>
      )}

      <div
        className={cn(
          "min-h-[1.6em] px-2 py-1 rounded",
          isLocked && "cursor-not-allowed",
          "[&_.tiptap-editor]:outline-none",
          "[&_.tiptap-editor_a]:text-blue-600 [&_.tiptap-editor_a]:underline [&_.tiptap-editor_a]:cursor-pointer"
        )}
        style={editorStyle}
      >
        <EditorContent editor={editor} />
      </div>

      <SlashMenuPortal />
    </div>
  );
}
