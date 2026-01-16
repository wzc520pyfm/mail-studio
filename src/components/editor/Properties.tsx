"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "@/stores/editor";
import {
  componentDefinitions,
  createNode,
  predefinedSocialPlatforms,
} from "@/lib/mjml/schema";
import { PropSchema, EditorNode, MJMLComponentType } from "@/types/editor";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

// Components that have editable child elements
const COMPONENTS_WITH_CHILDREN_EDITOR = [
  "mj-social",
  "mj-navbar",
  "mj-accordion",
  "mj-carousel",
];

export function Properties() {
  const { selectedId, findNode, removeNode } = useEditorStore();
  const selectedNode = selectedId ? findNode(selectedId) : null;

  if (!selectedNode) {
    return (
      <div className="h-full bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border">
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
  const hasChildrenEditor = COMPONENTS_WITH_CHILDREN_EDITOR.includes(
    selectedNode.type
  );

  const handleDelete = () => {
    removeNode(selectedNode.id);
  };

  return (
    <div className="h-full bg-muted/30 flex flex-col overflow-y-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">
              {def?.name || selectedNode.type}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedNode.type}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Content Editor for text-based components */}
          {selectedNode.content !== undefined && (
            <ContentEditor
              node={selectedNode}
              isHtmlContent={
                selectedNode.type === "mj-table" ||
                selectedNode.type === "mj-raw"
              }
            />
          )}

          {/* Children Editor for components with child elements */}
          {hasChildrenEditor && <ChildrenEditor node={selectedNode} />}

          {/* Property Fields */}
          {def?.propsSchema.map((schema) => (
            <PropertyField
              key={schema.key}
              schema={schema}
              node={selectedNode}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function ContentEditor({
  node,
  isHtmlContent = false,
}: {
  node: EditorNode;
  isHtmlContent?: boolean;
}) {
  const { updateNodeContent } = useEditorStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeContent(node.id, e.target.value);
    },
    [node.id, updateNodeContent]
  );

  return (
    <div className="space-y-2">
      <Label>{isHtmlContent ? "HTML Content" : "Content"}</Label>
      <textarea
        value={node.content || ""}
        onChange={handleChange}
        className={cn(
          "w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-y",
          isHtmlContent ? "min-h-[150px] font-mono text-xs" : "min-h-[80px]"
        )}
        placeholder={
          isHtmlContent ? "Enter HTML content..." : "Enter content..."
        }
      />
      {isHtmlContent && (
        <p className="text-xs text-muted-foreground">
          You can use raw HTML here. For tables, include &lt;tr&gt; and
          &lt;td&gt; tags.
        </p>
      )}
      <Separator className="my-4" />
    </div>
  );
}

// Children Editor for components like mj-social, mj-navbar, etc.
function ChildrenEditor({ node }: { node: EditorNode }) {
  const { updateNodeChildren, addChildNode, removeNode, setSelectedId } =
    useEditorStore();
  const def = componentDefinitions[node.type];

  if (!def?.allowedChildren || def.allowedChildren.length === 0) {
    return null;
  }

  const childType = def.allowedChildren[0] as MJMLComponentType;
  const childDef = componentDefinitions[childType];
  const children = node.children || [];

  const handleAddChild = () => {
    const newChild = createNode(childType);
    addChildNode(node.id, newChild);
  };

  const handleRemoveChild = (childId: string) => {
    removeNode(childId);
  };

  const handleMoveChild = (index: number, direction: "up" | "down") => {
    const newChildren = [...children];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newChildren.length) return;

    [newChildren[index], newChildren[newIndex]] = [
      newChildren[newIndex],
      newChildren[index],
    ];
    updateNodeChildren(node.id, newChildren);
  };

  const getChildLabel = (child: EditorNode, index: number): string => {
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
      const titleChild = child.children?.find(
        (c) => c.type === "mj-accordion-title"
      );
      return titleChild?.content || `Item ${index + 1}`;
    }
    return `${childDef?.name || childType} ${index + 1}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{childDef?.name || "Items"}</Label>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={handleAddChild}
        >
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
}

function PropertyField({
  schema,
  node,
}: {
  schema: PropSchema;
  node: EditorNode;
}) {
  const { updateNodeProps } = useEditorStore();
  const value = node.props[schema.key];

  const handleChange = useCallback(
    (newValue: string | number | undefined) => {
      updateNodeProps(node.id, { [schema.key]: newValue });
    },
    [node.id, schema.key, updateNodeProps]
  );

  switch (schema.type) {
    case "text":
    case "size":
    case "url":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <Input
            type="text"
            value={(value as string) || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={schema.placeholder || schema.defaultValue?.toString()}
            className="h-8 text-sm"
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <textarea
            value={(value as string) || ""}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={schema.placeholder || schema.defaultValue?.toString()}
            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <Input
            type="number"
            value={(value as number) || ""}
            onChange={(e) =>
              handleChange(e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder={schema.defaultValue?.toString()}
            className="h-8 text-sm"
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="color"
                value={(value as string) || schema.defaultValue || "#000000"}
                onChange={(e) => handleChange(e.target.value)}
                className="w-8 h-8 rounded border border-input cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={(value as string) || ""}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={schema.defaultValue?.toString() || "#000000"}
              className="h-8 text-sm flex-1"
            />
          </div>
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <Select value={(value as string) || ""} onValueChange={handleChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {schema.options?.map((option) => (
                <SelectItem key={option.value} value={option.value || "none"}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "alignment":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <div className="flex gap-1">
            <Button
              variant={value === "left" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange("left")}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={value === "center" || !value ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange("center")}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={value === "right" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange("right")}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );

    // Skip these types as they are handled by ChildrenEditor
    case "social-elements":
    case "navbar-links":
    case "accordion-elements":
    case "carousel-images":
      return null;

    default:
      return null;
  }
}
