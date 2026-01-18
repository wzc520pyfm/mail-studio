"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor";
import { MJMLComponentType } from "@/types/editor";
import { cn } from "@/lib/utils";
import {
  Type,
  Image,
  Minus,
  MousePointerClick,
  Plus,
  Table,
  Share2,
  Menu,
  ChevronDown,
  GalleryHorizontal,
  Code,
  MoveVertical,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddBlockButtonProps {
  parentId: string;
  hasColoredParent?: boolean;
}

const blockTypes = [
  { type: "mj-text" as const, icon: Type, label: "Text", category: "content" },
  { type: "mj-image" as const, icon: Image, label: "Image", category: "content" },
  { type: "mj-button" as const, icon: MousePointerClick, label: "Button", category: "interactive" },
  { type: "mj-divider" as const, icon: Minus, label: "Divider", category: "content" },
  { type: "mj-spacer" as const, icon: MoveVertical, label: "Spacer", category: "content" },
  { type: "mj-table" as const, icon: Table, label: "Table", category: "content" },
  { type: "mj-social" as const, icon: Share2, label: "Social", category: "interactive" },
  { type: "mj-navbar" as const, icon: Menu, label: "Navbar", category: "interactive" },
  { type: "mj-accordion" as const, icon: ChevronDown, label: "Accordion", category: "interactive" },
  {
    type: "mj-carousel" as const,
    icon: GalleryHorizontal,
    label: "Carousel",
    category: "interactive",
  },
  { type: "mj-raw" as const, icon: Code, label: "Raw HTML", category: "content" },
];

export function AddBlockButton({ parentId, hasColoredParent = false }: AddBlockButtonProps) {
  const { addNode, findNode } = useEditorStore();
  const [isOpen, setIsOpen] = useState(false);

  const getTargetParentId = () => {
    const parent = findNode(parentId);
    if (!parent) return parentId;

    if (parent.type === "mj-body") {
      const section = parent.children?.[0];
      if (section?.type === "mj-section") {
        const column = section.children?.[0];
        if (column?.type === "mj-column") {
          return column.id;
        }
      }
    }
    return parentId;
  };

  const handleAddBlock = (type: MJMLComponentType) => {
    const targetId = getTargetParentId();
    addNode(targetId, type);
    setIsOpen(false);
  };

  const contentBlocks = blockTypes.filter((b) => b.category === "content");
  const interactiveBlocks = blockTypes.filter((b) => b.category === "interactive");

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full py-2 flex items-center justify-center gap-2 rounded-lg transition-all",
            "opacity-0 hover:opacity-100 focus:opacity-100",
            !hasColoredParent && "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
            !hasColoredParent && isOpen && "opacity-100 bg-gray-100",
            hasColoredParent && "text-white/60 hover:bg-white/10 hover:text-white/90",
            hasColoredParent && isOpen && "opacity-100 bg-white/10"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add block</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-1">
              Content
            </div>
            <div className="space-y-0.5">
              {contentBlocks.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t pt-2">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 mb-1">
              Interactive
            </div>
            <div className="space-y-0.5">
              {interactiveBlocks.map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => handleAddBlock(type)}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-500" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
