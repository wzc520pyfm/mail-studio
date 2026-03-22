/**
 * Hero node renderer with droppable children
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

interface HeroNodeProps {
  node: EditorNode;
}

const heroAcceptTypes: MJMLComponentType[] = [
  "mj-text",
  "mj-image",
  "mj-button",
  "mj-divider",
  "mj-spacer",
];

export const HeroNode = memo(function HeroNode({ node }: HeroNodeProps) {
  const bgColor = (node.props["background-color"] as string) || "#ffffff";
  const bgImage = node.props["background-url"] as string | undefined;
  const bgPosition = (node.props["background-position"] as string) || "center center";
  const bgWidth = node.props["background-width"] as string | undefined;
  const bgHeight = node.props["background-height"] as string | undefined;
  const height = (node.props["height"] as string) || "0px";
  const padding = (node.props["padding"] as string) || "0px";
  const mode = (node.props["mode"] as string) || "fluid-height";
  const verticalAlign = (node.props["vertical-align"] as string) || "top";

  const isDraggingNewComponent = useUIStore((s) => s.isDraggingNewComponent);
  const { active } = useDndContext();
  const hasChildren = node.children && node.children.length > 0;

  // Check if we're dragging a NEW content component accepted by hero
  const activeData = active?.data.current;
  const activeType = (activeData?.componentType || activeData?.nodeType) as
    | MJMLComponentType
    | undefined;
  const isDraggingNewContent =
    isDraggingNewComponent && activeType && heroAcceptTypes.includes(activeType);

  // Show drop zone when empty OR when dragging NEW content
  const showDropZone = !hasChildren || isDraggingNewContent;

  return (
    <DroppableContainer nodeId={node.id} acceptTypes={heroAcceptTypes}>
      <div
        className="flex flex-col min-h-[120px]"
        style={{
          backgroundColor: bgColor,
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: bgWidth && bgHeight ? `${bgWidth} ${bgHeight}` : "cover",
          backgroundPosition: bgPosition,
          backgroundRepeat: "no-repeat",
          minHeight: mode === "fixed-height" && height !== "0px" ? height : "120px",
          padding,
          justifyContent:
            verticalAlign === "middle"
              ? "center"
              : verticalAlign === "bottom"
                ? "flex-end"
                : "flex-start",
          alignItems: "center",
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
              parentAcceptTypes={heroAcceptTypes}
            />
          ))}
        </SortableContext>
        {showDropZone && (
          <EmptyDropZone
            nodeId={node.id}
            message={hasChildren ? "Drop here to add" : "Drop content here"}
            small={!!hasChildren}
            acceptTypes={heroAcceptTypes}
            index={node.children?.length ?? 0}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
