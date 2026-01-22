"use client";

import { useState } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { GripVertical, Copy, Trash2, LayoutTemplate, Lock } from "lucide-react";
import { EditBlock } from "./EditBlock";
import { AddBlockButton } from "./AddBlockButton";

interface HeroContainerProps {
  node: EditorNode;
  dragHandleProps?: Record<string, unknown>;
  isLocked?: boolean;
}

export function HeroContainer({ node, dragHandleProps, isLocked = false }: HeroContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { selectedId, setSelectedId, removeNode, duplicateNode } = useEditorStore();
  const isSelected = selectedId === node.id;
  const isDirectlyLocked = node.locked ?? false;

  const bgColor = (node.props["background-color"] as string) || "#1e293b";
  const bgImage = node.props["background-url"] as string;
  const height = (node.props["height"] as string) || "300px";

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
          backgroundPosition: "center",
          minHeight: height,
        }}
      >
        {node.children?.map((child) => (
          <EditBlock key={child.id} node={child} parentId={node.id} isParentLocked={isLocked} />
        ))}
        {!isLocked && <AddBlockButton parentId={node.id} />}
      </div>
    </div>
  );
}
