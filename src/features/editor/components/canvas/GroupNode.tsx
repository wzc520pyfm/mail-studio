/**
 * Group node renderer with droppable column children
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

interface GroupNodeProps {
  node: EditorNode;
}

const groupAcceptTypes: MJMLComponentType[] = ["mj-column"];

export const GroupNode = memo(function GroupNode({ node }: GroupNodeProps) {
  const direction = (node.props["direction"] as string) || "ltr";
  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { active } = useDndContext();
  const hasChildren = node.children && node.children.length > 0;

  // Check if we're dragging a NEW column component
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isDraggingNewColumn =
    isDraggingNewComponent && activeType && groupAcceptTypes.includes(activeType);

  // Show drop zone when empty OR when dragging a NEW column
  const showDropZone = !hasChildren || isDraggingNewColumn;

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={groupAcceptTypes}>
      <div
        className="flex flex-wrap min-h-[60px]"
        style={{
          direction: direction as "ltr" | "rtl",
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
              parentAcceptTypes={groupAcceptTypes}
            />
          ))}
        </SortableContext>
        {showDropZone && (
          <EmptyDropZone
            nodeId={node.id}
            message={hasChildren ? "Drop here to add" : "Drop a Column here"}
            small
            acceptTypes={groupAcceptTypes}
            index={node.children?.length ?? 0}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
