/**
 * Content editor for text-based components
 */

"use client";

import { memo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  node: EditorNode;
  isHtmlContent?: boolean;
}

export const ContentEditor = memo(function ContentEditor({
  node,
  isHtmlContent = false,
}: ContentEditorProps) {
  const updateNodeContent = useEditorStore((s) => s.updateNodeContent);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeContent(node.id, e.target.value);
    },
    [node.id, updateNodeContent]
  );

  return (
    <div className="space-y-2">
      <Label>{isHtmlContent ? "HTML Content" : "Content"}</Label>
      <textarea
        value={node.content || ""}
        onChange={handleChange}
        className={cn(
          "w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y",
          isHtmlContent ? "min-h-[150px] font-mono text-xs" : "min-h-[80px]"
        )}
        placeholder={isHtmlContent ? "Enter HTML content..." : "Enter content..."}
      />
      {isHtmlContent && (
        <p className="text-xs text-muted-foreground">
          You can use raw HTML here. For tables, include &lt;tr&gt; and &lt;td&gt; tags.
        </p>
      )}
      <Separator className="my-4" />
    </div>
  );
});
