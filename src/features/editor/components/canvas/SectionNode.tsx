/**
 * Section node renderer with droppable children
 */

"use client";

import { memo } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
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
          strategy={verticalListSortingStrategy}
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
        {(!node.children || node.children.length === 0) && (
          <EmptyDropZone
            nodeId={node.id}
            message="Drop a Column here"
            small
            acceptTypes={sectionAcceptTypes}
          />
        )}
      </div>
    </DroppableContainer>
  );
});
