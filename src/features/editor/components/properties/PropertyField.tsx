/**
 * Property field renderer for different property types
 */

"use client";

import { memo, useCallback, useState } from "react";
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

// Separate component for text-based inputs to manage local state properly
// Uses key prop from parent to reset state when node/schema changes
const TextInputField = memo(function TextInputField({
  value,
  onChange,
  placeholder,
  type = "text",
  className = "h-8 text-sm",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <Input
      type={type}
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
    />
  );
});

// Separate component for textarea to manage local state properly
// Uses key prop from parent to reset state when node/schema changes
const TextareaField = memo(function TextareaField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
    />
  );
});

// Color input component with local state
// Uses key prop from parent to reset state when node/schema changes
const ColorInputField = memo(function ColorInputField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <div className="flex gap-2">
      <div className="relative">
        <input
          type="color"
          value={localValue || placeholder || "#000000"}
          onChange={handleColorChange}
          className="w-8 h-8 rounded border border-input cursor-pointer"
        />
      </div>
      <Input
        type="text"
        value={localValue}
        onChange={handleTextChange}
        placeholder={placeholder || "#000000"}
        className="h-8 text-sm flex-1"
      />
    </div>
  );
});

export const PropertyField = memo(function PropertyField({ schema, node }: PropertyFieldProps) {
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);
  const value = node.props[schema.key];

  const handleChange = useCallback(
    (newValue: string | number | undefined) => {
      updateNodeProps(node.id, { [schema.key]: newValue });
    },
    [node.id, schema.key, updateNodeProps]
  );

  // Use combined key to reset input state when node or schema changes
  const fieldKey = `${node.id}-${schema.key}`;

  switch (schema.type) {
    case "text":
    case "size":
    case "url":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <TextInputField
            key={fieldKey}
            value={(value as string) || ""}
            onChange={handleChange}
            placeholder={schema.placeholder || schema.defaultValue?.toString()}
          />
        </div>
      );

    case "textarea":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <TextareaField
            key={fieldKey}
            value={(value as string) || ""}
            onChange={handleChange}
            placeholder={schema.placeholder || schema.defaultValue?.toString()}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <TextInputField
            key={fieldKey}
            type="number"
            value={value !== undefined ? String(value) : ""}
            onChange={(v) => handleChange(v ? Number(v) : undefined)}
            placeholder={schema.defaultValue?.toString()}
          />
        </div>
      );

    case "color":
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <ColorInputField
            key={fieldKey}
            value={(value as string) || ""}
            onChange={handleChange}
            placeholder={schema.defaultValue?.toString()}
          />
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
