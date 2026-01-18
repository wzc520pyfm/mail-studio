/**
 * Accordion node renderer for Canvas mode
 * Displays a preview of accordion items
 */

"use client";

import { memo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorNode } from "@/features/editor/types";

interface AccordionNodeProps {
  node: EditorNode;
}

export const AccordionNode = memo(function AccordionNode({ node }: AccordionNodeProps) {
  const children = node.children || [];
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // Default expand first item for preview
    return new Set(children.length > 0 ? [children[0].id] : []);
  });

  const toggleItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const iconSrc = node.props["icon-wrapped-url"] as string;
  const iconUnwrappedSrc = node.props["icon-unwrapped-url"] as string;
  const iconPosition = (node.props["icon-position"] as string) || "right";

  return (
    <div className="py-2">
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-500">Accordion</span>
        </div>

        {children.length > 0 ? (
          <div className="divide-y">
            {children.map((element) => {
              const titleChild = element.children?.find((c) => c.type === "mj-accordion-title");
              const textChild = element.children?.find((c) => c.type === "mj-accordion-text");
              const isExpanded = expandedItems.has(element.id);
              const titleBg = (titleChild?.props["background-color"] as string) || "#f8fafc";
              const textBg = (textChild?.props["background-color"] as string) || "#ffffff";

              return (
                <div key={element.id}>
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ backgroundColor: titleBg }}
                    onClick={(e) => toggleItem(element.id, e)}
                  >
                    {iconPosition === "left" && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-gray-400 transition-transform mr-2 flex-shrink-0",
                          isExpanded && "rotate-90"
                        )}
                      />
                    )}
                    <span className="text-sm font-medium flex-1">
                      {titleChild?.content || "Accordion Item"}
                    </span>
                    {iconPosition === "right" && (
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-gray-400 transition-transform ml-2 flex-shrink-0",
                          isExpanded && "rotate-90"
                        )}
                      />
                    )}
                  </div>
                  {isExpanded && (
                    <div
                      className="px-4 py-3 text-sm text-gray-600 border-t animate-in fade-in slide-in-from-top-1 duration-200"
                      style={{ backgroundColor: textBg }}
                    >
                      {textChild?.content || "Accordion content"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-sm text-gray-400 italic text-center">No accordion items</div>
        )}
      </div>
    </div>
  );
});
