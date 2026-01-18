/**
 * Canvas body - root document renderer
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

interface CanvasBodyProps {
  node: EditorNode;
}

const bodyAcceptTypes: MJMLComponentType[] = ["mj-section", "mj-wrapper", "mj-hero"];

export const CanvasBody = memo(function CanvasBody({ node }: CanvasBodyProps) {
  const bgColor = (node.props["background-color"] as string) || "#f4f4f4";
  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { active } = useDndContext();
  const hasChildren = node.children && node.children.length > 0;

  // Check if we're dragging a NEW layout component (not reordering existing ones)
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isDraggingNewLayoutComponent =
    isDraggingNewComponent && activeType && bodyAcceptTypes.includes(activeType);

  // Show drop zone when empty OR when dragging a NEW layout component (not during reorder)
  const showDropZone = !hasChildren || isDraggingNewLayoutComponent;

  return (
    <div className="min-h-[400px]" style={{ backgroundColor: bgColor }}>
      <DroppableContainer nodeId={node.id} acceptTypes={bodyAcceptTypes}>
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
              parentAcceptTypes={bodyAcceptTypes}
            />
          ))}
        </SortableContext>
        {showDropZone && (
          <EmptyDropZone
            nodeId={node.id}
            message={hasChildren ? "Drop here to add" : "Drop a Section here to start"}
            acceptTypes={bodyAcceptTypes}
            small={hasChildren}
            index={node.children?.length ?? 0}
          />
        )}
      </DroppableContainer>
    </div>
  );
});
