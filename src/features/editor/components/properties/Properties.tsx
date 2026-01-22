/**
 * Properties panel for editing selected node properties
 */

"use client";

import { memo } from "react";
import { Trash2, Lock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useEditorStore, useSelectedNode, useIsNodeLocked } from "@/features/editor/stores";
import { componentDefinitions } from "@/features/editor/lib/mjml/schema";
import { ContentEditor } from "./ContentEditor";
import { ChildrenEditor } from "./ChildrenEditor";
import { PropertyField } from "./PropertyField";

// Components that have editable child elements
const COMPONENTS_WITH_CHILDREN_EDITOR = ["mj-social", "mj-navbar", "mj-accordion", "mj-carousel"];

export const Properties = memo(function Properties() {
  const removeNode = useEditorStore((s) => s.removeNode);
  const selectedNode = useSelectedNode();
  const selectedId = useEditorStore((s) => s.selectedId);
  const isLocked = useIsNodeLocked(selectedId || "");

  if (!selectedNode) {
    return (
      <div className="h-full bg-muted/30 flex flex-col">
        <div className="p-4 pr-12 lg:pr-4 border-b border-border">
          <h2 className="font-semibold">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select an element to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const def = componentDefinitions[selectedNode.type];
  const hasChildrenEditor = COMPONENTS_WITH_CHILDREN_EDITOR.includes(selectedNode.type);

  const handleDelete = () => {
    removeNode(selectedNode.id);
  };

  return (
    <div className="h-full bg-muted/30 flex flex-col overflow-y-hidden">
      <div className="p-4 pr-10 lg:pr-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold truncate">{def?.name || selectedNode.type}</h2>
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-amber-100 text-amber-700">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedNode.type}</p>
          </div>
          {!isLocked && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mt-[-28px] flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Locked content warning */}
      {isLocked && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2 text-amber-700 text-sm">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <span>This element is part of a locked template section and cannot be edited.</span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Content Editor for text-based components */}
          {selectedNode.content !== undefined && (
            <ContentEditor
              node={selectedNode}
              isHtmlContent={selectedNode.type === "mj-table" || selectedNode.type === "mj-raw"}
              isLocked={isLocked}
            />
          )}

          {/* Children Editor for components with child elements */}
          {hasChildrenEditor && <ChildrenEditor node={selectedNode} isLocked={isLocked} />}

          {/* Property Fields */}
          {def?.propsSchema.map((schema) => (
            <PropertyField
              key={schema.key}
              schema={schema}
              node={selectedNode}
              isLocked={isLocked}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});
