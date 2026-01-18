/**
 * Section node renderer with droppable children
 */

"use client";

import { memo } from "react";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useDndContext } from "@dnd-kit/core";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
import { useUIStore } from "@/features/editor/stores";
import { DroppableContainer } from "./DroppableContainer";
import { EmptyDropZone } from "./EmptyDropZone";
import { CanvasNode } from "./CanvasNode";

interface SectionNodeProps {
  node: EditorNode;
}

const sectionAcceptTypes: MJMLComponentType[] = ["mj-column"];

export const SectionNode = memo(function SectionNode({ node }: SectionNodeProps) {
  const bgColor = node.props["background-color"] as string;
  const padding = (node.props["padding"] as string) || "20px 0";
  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { active } = useDndContext();
  const hasChildren = node.children && node.children.length > 0;

  // Check if we're dragging a NEW column component (not reordering existing ones)
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isDraggingNewColumn =
    isDraggingNewComponent && activeType && sectionAcceptTypes.includes(activeType);

  // Show drop zone when empty OR when dragging a NEW column (not during reorder)
  const showDropZone = !hasChildren || isDraggingNewColumn;

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={sectionAcceptTypes}>
      <div
        className="flex flex-wrap"
        style={{
          backgroundColor: bgColor,
          padding,
        }}
      >
        <SortableContext
          items={node.children?.map((c) => c.id) || []}
          strategy={horizontalListSortingStrategy}
        >
          {node.children?.map((child, index) => (
            <CanvasNode
              key={child.id}
              node={child}
              index={index}
              parentId={node.id}
              parentAcceptTypes={sectionAcceptTypes}
            />
          ))}
        </SortableContext>
        {showDropZone && (
          <EmptyDropZone
            nodeId={node.id}
            message={hasChildren ? "Drop here to add" : "Drop a Column here"}
            small
            acceptTypes={sectionAcceptTypes}
            index={node.children?.length ?? 0}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
