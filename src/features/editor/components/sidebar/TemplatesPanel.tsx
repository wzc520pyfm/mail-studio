/**
 * Templates panel showing available email templates
 */

"use client";

import { memo, useCallback } from "react";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/features/editor/stores";
import { templates, cloneDocumentWithNewIds } from "@/features/editor/lib/mjml/templates";
import type { EditorNode } from "@/features/editor/types";
import { cn } from "@/lib/utils";

export const TemplatesPanel = memo(function TemplatesPanel() {
  const loadTemplate = useEditorStore((s) => s.loadTemplate);

  const handleSelectTemplate = useCallback(
    (document: EditorNode) => {
      loadTemplate(cloneDocumentWithNewIds(document));
    },
    [loadTemplate]
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template.document)}
            className={cn(
              "w-full p-3 rounded-lg border border-border bg-background text-left",
              "hover:border-primary/50 hover:bg-accent/50 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{template.category}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
});
