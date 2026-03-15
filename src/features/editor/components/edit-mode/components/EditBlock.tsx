"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditorStore, useIsNodeLocked } from "@/features/editor/stores";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Trash2,
  Lock,
  Copy,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Type,
  Image,
  MousePointerClick,
  Minus,
  MoveVertical,
  Table,
  Code,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EditableText,
  EditableImage,
  EditableButton,
  EditableDivider,
  EditableSpacer,
  EditableTable,
  EditableSocial,
  EditableNavbar,
  EditableAccordion,
  EditableCarousel,
  EditableRaw,
} from "./blocks";

const TURN_INTO_OPTIONS: { type: MJMLComponentType; label: string; icon: React.ElementType }[] = [
  { type: "mj-text", label: "Text", icon: Type },
  { type: "mj-image", label: "Image", icon: Image },
  { type: "mj-button", label: "Button", icon: MousePointerClick },
  { type: "mj-divider", label: "Divider", icon: Minus },
  { type: "mj-spacer", label: "Spacer", icon: MoveVertical },
  { type: "mj-table", label: "Table", icon: Table },
  { type: "mj-raw", label: "Raw HTML", icon: Code },
];

interface EditBlockProps {
  node: EditorNode;
  parentId: string;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
  hasColoredParent?: boolean;
  isParentLocked?: boolean;
}

export function EditBlock({
  node,
  parentId: _parentId,
  dragHandleProps,
  isDragging,
  hasColoredParent = false,
  isParentLocked = false,
}: EditBlockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const hadDragMotionRef = useRef(false);
  const { removeNode, duplicateNode, moveNode, selectedId, setSelectedId, findParent, addNode } =
    useEditorStore();
  const isSelected = selectedId === node.id;

  const isNodeLocked = useIsNodeLocked(node.id);
  const isLocked = isNodeLocked || isParentLocked;
  const isDirectlyLocked = node.locked ?? false;

  const handleDelete = useCallback(() => {
    if (isLocked) return;
    removeNode(node.id);
  }, [node.id, removeNode, isLocked]);

  const handleDuplicate = useCallback(() => {
    if (isLocked) return;
    duplicateNode(node.id);
  }, [node.id, duplicateNode, isLocked]);

  const handleMoveUp = useCallback(() => {
    if (isLocked) return;
    const parentInfo = findParent(node.id);
    if (!parentInfo || parentInfo.index === 0) return;
    moveNode(node.id, parentInfo.parent.id, parentInfo.index - 1);
  }, [node.id, findParent, moveNode, isLocked]);

  const handleMoveDown = useCallback(() => {
    if (isLocked) return;
    const parentInfo = findParent(node.id);
    if (!parentInfo) return;
    const siblings = parentInfo.parent.children;
    if (!siblings || parentInfo.index >= siblings.length - 1) return;
    moveNode(node.id, parentInfo.parent.id, parentInfo.index + 2);
  }, [node.id, findParent, moveNode, isLocked]);

  const handleTurnInto = useCallback(
    (newType: MJMLComponentType) => {
      if (isLocked) return;
      const parentInfo = findParent(node.id);
      if (!parentInfo) return;
      removeNode(node.id);
      addNode(parentInfo.parent.id, newType, parentInfo.index);
    },
    [node.id, findParent, removeNode, addNode, isLocked]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (!target.closest('[contenteditable="true"]')) {
        setSelectedId(node.id);
      }
    },
    [node.id, setSelectedId]
  );

  useEffect(() => {
    if (!isSelected || isLocked) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('[contenteditable="true"]') ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleDelete();
      }
      if (e.key === "d" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleDuplicate();
      }
      if (e.key === "ArrowUp" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        handleMoveUp();
      }
      if (e.key === "ArrowDown" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        handleMoveDown();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isSelected, isLocked, handleDelete, handleDuplicate, handleMoveUp, handleMoveDown]);

  const showControls = isHovered || isSelected || menuOpen;

  return (
    <div
      className={cn(
        "group relative rounded-lg transition-all duration-150",
        !hasColoredParent && isHovered && (isLocked ? "bg-amber-50/70" : "bg-gray-100/70"),
        !hasColoredParent &&
          isSelected &&
          (isLocked
            ? "bg-amber-50/50 ring-2 ring-amber-200"
            : "bg-blue-50/50 ring-2 ring-blue-200"),
        hasColoredParent &&
          isHovered &&
          !isSelected &&
          (isLocked
            ? "bg-amber-50/10 ring-1 ring-amber-200/20"
            : "bg-white/10 ring-1 ring-white/20"),
        hasColoredParent &&
          isSelected &&
          (isLocked
            ? "bg-amber-50/15 ring-2 ring-amber-200/40"
            : "bg-white/15 ring-2 ring-white/40"),
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!menuOpen) setIsHovered(false);
      }}
      onClick={handleClick}
    >
      <div
        className={cn(
          "absolute -left-10 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 transition-opacity",
          showControls && "opacity-100"
        )}
      >
        {isLocked ? (
          <div
            className="p-1 rounded text-amber-500"
            title={isDirectlyLocked ? "This block is locked" : "Parent is locked"}
          >
            <Lock className="w-4 h-4" />
          </div>
        ) : (
          <DropdownMenu
            open={menuOpen}
            onOpenChange={(open) => {
              if (!open) {
                setMenuOpen(false);
                setIsHovered(false);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <button
                className="p-1 rounded cursor-grab active:cursor-grabbing touch-none hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                title="Drag to reorder · Click for options"
                {...dragHandleProps}
                onPointerDown={(e) => {
                  pointerStartRef.current = { x: e.clientX, y: e.clientY };
                  hadDragMotionRef.current = false;
                  const handler = dragHandleProps?.onPointerDown as
                    | ((e: React.PointerEvent) => void)
                    | undefined;
                  handler?.(e);
                  e.preventDefault();
                }}
                onPointerMove={(e) => {
                  if (pointerStartRef.current) {
                    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
                    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
                    if (dx > 3 || dy > 3) {
                      hadDragMotionRef.current = true;
                    }
                  }
                }}
                onPointerUp={() => {
                  if (pointerStartRef.current && !hadDragMotionRef.current) {
                    setMenuOpen((prev) => !prev);
                  }
                  pointerStartRef.current = null;
                  hadDragMotionRef.current = false;
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="left" align="start" className="w-48">
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveUp}>
                <ArrowUp className="w-4 h-4 mr-2" />
                Move Up
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMoveDown}>
                <ArrowDown className="w-4 h-4 mr-2" />
                Move Down
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Turn Into
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-40">
                  {TURN_INTO_OPTIONS.filter((opt) => opt.type !== node.type).map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <DropdownMenuItem key={opt.type} onClick={() => handleTurnInto(opt.type)}>
                        <Icon className="w-4 h-4 mr-2" />
                        {opt.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="py-1">
        {node.type === "mj-text" && <EditableText node={node} isLocked={isLocked} />}
        {node.type === "mj-image" && <EditableImage node={node} isLocked={isLocked} />}
        {node.type === "mj-button" && <EditableButton node={node} isLocked={isLocked} />}
        {node.type === "mj-divider" && <EditableDivider node={node} />}
        {node.type === "mj-spacer" && <EditableSpacer node={node} />}
        {node.type === "mj-table" && <EditableTable node={node} isLocked={isLocked} />}
        {node.type === "mj-social" && <EditableSocial node={node} />}
        {node.type === "mj-navbar" && <EditableNavbar node={node} />}
        {node.type === "mj-accordion" && <EditableAccordion node={node} />}
        {node.type === "mj-carousel" && <EditableCarousel node={node} />}
        {node.type === "mj-raw" && <EditableRaw node={node} isLocked={isLocked} />}
      </div>
    </div>
  );
}

// Sortable wrapper for EditBlock
interface SortableEditBlockProps {
  node: EditorNode;
  parentId: string;
  hasColoredParent: boolean;
  isParentLocked?: boolean;
}

export function SortableEditBlock({
  node,
  parentId,
  hasColoredParent,
  isParentLocked = false,
}: SortableEditBlockProps) {
  const isLocked = useIsNodeLocked(node.id) || isParentLocked;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditBlock
        node={node}
        parentId={parentId}
        dragHandleProps={isLocked ? undefined : { ...attributes, ...listeners }}
        isDragging={isDragging}
        hasColoredParent={hasColoredParent}
        isParentLocked={isParentLocked}
      />
    </div>
  );
}

// Block content preview for DragOverlay
export function EditBlockContent({ node }: { node: EditorNode }) {
  return (
    <div className="py-1 px-2">
      {node.type === "mj-text" && (
        <div
          className="min-h-[1.6em] px-2 py-1 text-gray-600"
          dangerouslySetInnerHTML={{ __html: node.content || "Text block" }}
        />
      )}
      {node.type === "mj-image" && (
        <div className="py-2 text-center">
          {node.props["src"] ? (
            <img
              src={node.props["src"] as string}
              alt=""
              className="max-w-full h-auto max-h-20 rounded"
            />
          ) : (
            <div className="text-gray-400 text-sm">Image</div>
          )}
        </div>
      )}
      {node.type === "mj-button" && (
        <div className="py-2 text-center">
          <span
            className="inline-block px-4 py-2 text-sm rounded"
            style={{
              backgroundColor: (node.props["background-color"] as string) || "#414141",
              color: (node.props["color"] as string) || "#ffffff",
            }}
          >
            {node.content || "Button"}
          </span>
        </div>
      )}
      {node.type === "mj-divider" && (
        <div className="py-2">
          <hr className="border-gray-300" />
        </div>
      )}
      {node.type === "mj-spacer" && (
        <div className="py-2 text-center text-gray-400 text-xs">
          Spacer ({node.props["height"] || "0px"})
        </div>
      )}
      {!["mj-text", "mj-image", "mj-button", "mj-divider", "mj-spacer"].includes(node.type) && (
        <div className="py-2 text-center text-gray-500 text-sm">{node.type.replace("mj-", "")}</div>
      )}
    </div>
  );
}
