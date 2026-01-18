/**
 * Children editor for components like mj-social, mj-navbar, etc.
 */

"use client";

import { memo, useCallback, useMemo } from "react";
import { Plus, GripVertical, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/features/editor/stores";
import {
  componentDefinitions,
  createNode,
  predefinedSocialPlatforms,
} from "@/features/editor/lib/mjml/schema";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";

interface ChildrenEditorProps {
  node: EditorNode;
}

export const ChildrenEditor = memo(function ChildrenEditor({ node }: ChildrenEditorProps) {
  const updateNodeChildren = useEditorStore((s) => s.updateNodeChildren);
  const addChildNode = useEditorStore((s) => s.addChildNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);

  const def = componentDefinitions[node.type];
  const hasAllowedChildren = def?.allowedChildren && def.allowedChildren.length > 0;
  const childType = hasAllowedChildren ? (def.allowedChildren[0] as MJMLComponentType) : null;
  const childDef = childType ? componentDefinitions[childType] : null;
  const children = useMemo(() => node.children || [], [node.children]);

  const handleAddChild = useCallback(() => {
    if (!childType) return;
    const newChild = createNode(childType);
    addChildNode(node.id, newChild);
  }, [node.id, childType, addChildNode]);

  const handleRemoveChild = useCallback(
    (childId: string) => {
      removeNode(childId);
    },
    [removeNode]
  );

  const handleMoveChild = useCallback(
    (index: number, direction: "up" | "down") => {
      const newChildren = [...children];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newChildren.length) return;

      [newChildren[index], newChildren[newIndex]] = [newChildren[newIndex], newChildren[index]];
      updateNodeChildren(node.id, newChildren);
    },
    [node.id, children, updateNodeChildren]
  );

  const getChildLabel = useCallback(
    (child: EditorNode, index: number): string => {
      if (child.type === "mj-social-element") {
        const name = child.props.name as string;
        const platform = predefinedSocialPlatforms.find((p) => p.name === name);
        return platform?.label || name || `Social ${index + 1}`;
      }
      if (child.type === "mj-navbar-link") {
        return child.content || `Link ${index + 1}`;
      }
      if (child.type === "mj-carousel-image") {
        return (child.props.alt as string) || `Slide ${index + 1}`;
      }
      if (child.type === "mj-accordion-element") {
        const titleChild = child.children?.find((c) => c.type === "mj-accordion-title");
        return titleChild?.content || `Item ${index + 1}`;
      }
      return `${childDef?.name || childType} ${index + 1}`;
    },
    [childDef?.name, childType]
  );

  // Early return after all hooks
  if (!hasAllowedChildren) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{childDef?.name || "Items"}</Label>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleAddChild}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
          No items yet. Click &quot;Add&quot; to create one.
        </div>
      ) : (
        <div className="space-y-2">
          {children.map((child, index) => (
            <div
              key={child.id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg group"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <button
                className="flex-1 text-left text-sm truncate hover:text-primary transition-colors"
                onClick={() => setSelectedId(child.id)}
              >
                {getChildLabel(child, index)}
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleMoveChild(index, "up")}
                  disabled={index === 0}
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleMoveChild(index, "down")}
                  disabled={index === children.length - 1}
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveChild(child.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator className="my-4" />
    </div>
  );
});
