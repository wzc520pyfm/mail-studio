/**
 * Content editor for text-based components
 */

"use client";

import { memo, useCallback, useState } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  node: EditorNode;
  isHtmlContent?: boolean;
  isLocked?: boolean;
}

// Inner component that resets state when key changes
const ContentEditorInner = memo(function ContentEditorInner({
  node,
  isHtmlContent = false,
  isLocked = false,
}: ContentEditorProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);

  // Local state initialized from node.content
  const [localValue, setLocalValue] = useState(node.content || "");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (isLocked) return;
      const newValue = e.target.value;
      setLocalValue(newValue);
      updateNodeContent(node.id, newValue);
    },
    [node.id, updateNodeContent, isLocked]
  );

  return (
    <div className="space-y-2">
      <Label>{isHtmlContent ? "HTML Content" : "Content"}</Label>
      <textarea
        value={localValue}
        onChange={handleChange}
        disabled={isLocked}
        className={cn(
          "w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y",
          isHtmlContent ? "min-h-[150px] font-mono text-xs" : "min-h-[80px]",
          isLocked && "opacity-50 cursor-not-allowed"
        )}
        placeholder={isHtmlContent ? "Enter HTML content..." : "Enter content..."}
      />
      {isHtmlContent && !isLocked && (
        <p className="text-xs text-muted-foreground">
          You can use raw HTML here. For tables, include &lt;tr&gt; and &lt;td&gt; tags.
        </p>
      )}
      <Separator className="my-4" />
    </div>
  );
});

// Wrapper that uses key to reset state when node changes
export const ContentEditor = memo(function ContentEditor(props: ContentEditorProps) {
  // Use node.id as key to reset internal state when switching nodes
  return <ContentEditorInner key={props.node.id} {...props} />;
});
