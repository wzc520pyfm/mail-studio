"use client";

import { useState } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { generateId } from "@/features/editor/lib/mjml";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";

interface EditableAccordionProps {
  node: EditorNode;
}

export function EditableAccordion({ node }: EditableAccordionProps) {
  const { addChildNode, removeNode, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddItem = () => {
    const newItem: EditorNode = {
      id: generateId(),
      type: "mj-accordion-element",
      props: {},
      children: [
        {
          id: generateId(),
          type: "mj-accordion-title",
          props: { padding: "16px", "font-size": "13px" },
          content: "New Accordion Title",
        },
        {
          id: generateId(),
          type: "mj-accordion-text",
          props: { padding: "16px", "font-size": "13px" },
          content: "Accordion content goes here.",
        },
      ],
    };
    addChildNode(node.id, newItem);
  };

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setSelectedId(node.id)}
      >
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Accordion</span>
        </div>

        <div className="divide-y">
          {children.map((element) => {
            const titleChild = element.children?.find((c) => c.type === "mj-accordion-title");
            const textChild = element.children?.find((c) => c.type === "mj-accordion-text");
            const isExpanded = expandedItems.has(element.id);
            const titleBg = titleChild?.props["background-color"] as string;
            const titlePadding = (titleChild?.props["padding"] as string) || "16px";
            const titleFontSize = (titleChild?.props["font-size"] as string) || "13px";
            const titleColor = titleChild?.props["color"] as string;
            const textBg = textChild?.props["background-color"] as string;
            const textPadding = (textChild?.props["padding"] as string) || "16px";
            const textFontSize = (textChild?.props["font-size"] as string) || "13px";
            const textColor = textChild?.props["color"] as string;

            return (
              <div key={element.id} className="group">
                <div
                  className="flex items-center justify-between cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: titleBg, padding: titlePadding }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(element.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 text-gray-400 transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                    <span style={{ fontSize: titleFontSize, color: titleColor }}>
                      {titleChild?.content || "Accordion Item"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNode(element.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                {isExpanded && (
                  <div
                    className="border-t"
                    style={{
                      backgroundColor: textBg,
                      padding: textPadding,
                      fontSize: textFontSize,
                      color: textColor,
                    }}
                  >
                    {textChild?.content || "Content"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-3 py-2 border-t">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddItem();
            }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add accordion item
          </button>
        </div>
      </div>
    </div>
  );
}
