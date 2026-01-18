/**
 * Components panel showing draggable MJML components
 */

"use client";

import { memo } from "react";
import { LayoutGrid, FileText, MousePointerClick, Share2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { componentCategories } from "@/features/editor/lib/mjml/schema";
import { DraggableComponent } from "./DraggableComponent";

// Category icons mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: LayoutGrid,
  content: FileText,
  interactive: MousePointerClick,
  social: Share2,
};

export const ComponentsPanel = memo(function ComponentsPanel() {
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {componentCategories.map((category) => {
          const IconComponent = categoryIcons[category.id];
          return (
            <div key={category.id}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                {category.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.components.map((type) => (
                  <DraggableComponent key={type} type={type} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
});
