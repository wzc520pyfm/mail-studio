/**
 * Spacer node renderer for the canvas
 */

"use client";

import { memo } from "react";
import type { EditorNode } from "@/features/editor/types";

interface SpacerNodeProps {
  node: EditorNode;
}

export const SpacerNode = memo(function SpacerNode({ node }: SpacerNodeProps) {
  const height = (node.props["height"] as string) || "30px";

  return (
    <div
      className="bg-muted/30 border border-dashed border-muted-foreground/20 flex items-center justify-center"
      style={{ height }}
    >
      <span className="text-xs text-muted-foreground">Spacer ({height})</span>
    </div>
  );
});
