/**
 * Wrapper node renderer with droppable children (sections)
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

interface WrapperNodeProps {
  node: EditorNode;
}

const wrapperAcceptTypes: MJMLComponentType[] = ["mj-section", "mj-hero"];

export const WrapperNode = memo(function WrapperNode({ node }: WrapperNodeProps) {
  const bgColor = node.props["background-color"] as string;
  const bgUrl = node.props["background-url"] as string | undefined;
  const padding = (node.props["padding"] as string) || "20px 0";
  const border = node.props["border"] as string | undefined;
  const borderRadius = node.props["border-radius"] as string | undefined;
  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { active } = useDndContext();
  const hasChildren = node.children && node.children.length > 0;

  // Check if we're dragging a NEW section/hero component (not reordering existing ones)
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isDraggingNewSection =
    isDraggingNewComponent && activeType && wrapperAcceptTypes.includes(activeType);

  // Show drop zone when empty OR when dragging a NEW section (not during reorder)
  const showDropZone = !hasChildren || isDraggingNewSection;

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={wrapperAcceptTypes}>
      <div
        className="min-h-[60px]"
        style={{
          backgroundColor: bgColor,
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundSize: (node.props["background-size"] as string) || "auto",
          backgroundRepeat: (node.props["background-repeat"] as string) || "repeat",
          padding,
          border,
          borderRadius,
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
              parentAcceptTypes={wrapperAcceptTypes}
            />
          ))}
        </SortableContext>
        {showDropZone && (
          <EmptyDropZone
            nodeId={node.id}
            message={hasChildren ? "Drop here to add" : "Drop a Section here"}
            small={!!hasChildren}
            acceptTypes={wrapperAcceptTypes}
            index={node.children?.length ?? 0}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
