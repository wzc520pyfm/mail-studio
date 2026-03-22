"use client";

import { useState } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { GripVertical, Copy, Trash2, LayoutTemplate, Lock } from "lucide-react";
import { SortableEditBlock, EditBlockContent } from "./EditBlock";
import { AddBlockButton } from "./AddBlockButton";

interface HeroContainerProps {
  node: EditorNode;
  dragHandleProps?: Record<string, unknown>;
  isLocked?: boolean;
}

export function HeroContainer({ node, dragHandleProps, isLocked = false }: HeroContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedId, setSelectedId, removeNode, duplicateNode, updateNodeChildren } =
    useEditorStore();
  const isSelected = selectedId === node.id;
  const isDirectlyLocked = node.locked ?? false;
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const bgColor = (node.props["background-color"] as string) || "#ffffff";
  const bgImage = node.props["background-url"] as string;
  const bgPosition = (node.props["background-position"] as string) || "center center";
  const height = (node.props["height"] as string) || "0px";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const childIds = node.children?.map((child) => child.id) || [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = childIds.indexOf(active.id as string);
      const newIndex = childIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1 && node.children) {
        const newChildren = arrayMove(node.children, oldIndex, newIndex);
        updateNodeChildren(node.id, newChildren);
      }
    }
  };

  const activeNode = activeId ? node.children?.find((child) => child.id === activeId) : null;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div
      className={cn(
        "relative group rounded-lg transition-all",
        isSelected
          ? isLocked
            ? "ring-2 ring-amber-400 ring-offset-2"
            : "ring-2 ring-blue-400 ring-offset-2"
          : "",
        isHovered && !isSelected && (isLocked ? "ring-2 ring-amber-200" : "ring-2 ring-gray-200")
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(node.id);
      }}
    >
      {(isHovered || isSelected) && (
        <div
          className={cn(
            "absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg",
            isLocked ? "bg-amber-500/80" : "bg-black/60"
          )}
        >
          {isLocked ? (
            <>
              <div className="p-1 text-white" title="This hero section is locked">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs text-white font-medium">
                <LayoutTemplate className="w-3 h-3 inline mr-1" />
                Hero {isDirectlyLocked && "(Locked)"}
              </span>
            </>
          ) : (
            <>
              {dragHandleProps && (
                <button
                  className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white cursor-grab active:cursor-grabbing touch-none"
                  title="Drag to reorder"
                  {...dragHandleProps}
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-xs text-white/80 font-medium mr-1">
                <LayoutTemplate className="w-3 h-3 inline mr-1" />
                Hero
              </span>
              <div className="w-px h-4 bg-white/30" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateNode(node.id);
                }}
                className="p-1 rounded hover:bg-white/20 text-white/80 hover:text-white"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNode(node.id);
                }}
                className="p-1 rounded hover:bg-red-500/50 text-white/80 hover:text-white"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      <div
        className="flex flex-col items-center justify-center p-8"
        style={{
          backgroundColor: bgColor,
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: bgPosition,
          minHeight: height,
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            <div className="w-full space-y-1">
              {node.children?.map((child) => (
                <SortableEditBlock
                  key={child.id}
                  node={child}
                  parentId={node.id}
                  hasColoredParent={true}
                  isParentLocked={isLocked}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeNode ? (
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-400 opacity-90">
                <EditBlockContent node={activeNode} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        {!isLocked && (
          <AddBlockButton parentId={node.id} hasColoredParent alwaysVisible={!hasChildren} />
        )}
      </div>
    </div>
  );
}
