/**
 * Property field renderer for different property types
 */

"use client";

import { memo, useCallback } from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
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
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode, PropSchema } from "@/features/editor/types";

interface PropertyFieldProps {
  schema: PropSchema;
  node: EditorNode;
}

export const PropertyField = memo(function PropertyField({ schema, node }: PropertyFieldProps) {
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);
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
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : undefined)}
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
});
