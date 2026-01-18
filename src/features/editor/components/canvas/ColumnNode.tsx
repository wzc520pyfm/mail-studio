/**
 * Column node renderer with droppable children
 */

"use client";

import { memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
import { useUIStore } from "@/features/editor/stores";
import { DroppableContainer } from "./DroppableContainer";
import { EmptyDropZone } from "./EmptyDropZone";
import { CanvasNode } from "./CanvasNode";

interface ColumnNodeProps {
  node: EditorNode;
}

const columnAcceptTypes: MJMLComponentType[] = [
  "mj-text",
  "mj-image",
  "mj-button",
  "mj-divider",
  "mj-spacer",
  "mj-social",
  "mj-navbar",
  "mj-accordion",
  "mj-carousel",
  "mj-table",
  "mj-raw",
];

export const ColumnNode = memo(function ColumnNode({ node }: ColumnNodeProps) {
  const bgColor = node.props["background-color"] as string;
  const padding = (node.props["padding"] as string) || "10px";
  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { active } = useDndContext();
  const hasChildren = node.children && node.children.length > 0;

  // Check if we're dragging a NEW content component (not reordering existing ones)
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isDraggingNewContent =
    isDraggingNewComponent && activeType && columnAcceptTypes.includes(activeType);

  // Show drop zone when empty OR when dragging NEW content (not during reorder)
  const showDropZone = !hasChildren || isDraggingNewContent;

  // Note: flex/width properties are applied to the CanvasNode wrapper for proper flex layout
  return (
    <DroppableContainer nodeId={node.id} acceptTypes={columnAcceptTypes}>
      <div
        className="min-h-[60px] w-full"
        style={{
          backgroundColor: bgColor,
          padding,
        }}
      >
        <SortableContext
          items={node.children?.map((c) => c.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {node.children?.map((child, index) => (
            <CanvasNode
              key={child.id}
              node={child}
              index={index}
              parentId={node.id}
              parentAcceptTypes={columnAcceptTypes}
            />
          ))}
        </SortableContext>
        {showDropZone && (
          <EmptyDropZone
            nodeId={node.id}
            message={hasChildren ? "Drop here to add" : "Drop content here"}
            small
            acceptTypes={columnAcceptTypes}
            index={node.children?.length ?? 0}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
