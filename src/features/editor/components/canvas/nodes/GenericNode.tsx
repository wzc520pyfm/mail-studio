/**
 * Generic node renderer for unknown/unimplemented components
 */

"use client";

import { memo } from "react";
import type { EditorNode } from "@/features/editor/types";

interface GenericNodeProps {
  node: EditorNode;
}

export const GenericNode = memo(function GenericNode({ node }: GenericNodeProps) {
  return (
    <div className="p-4 bg-muted/50 border border-dashed border-muted-foreground/30 rounded">
      <span className="text-sm text-muted-foreground">{node.type}</span>
    </div>
  );
});
