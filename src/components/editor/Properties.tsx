'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/stores/editor';
import { componentDefinitions } from '@/lib/mjml/schema';
import { PropSchema, EditorNode } from '@/types/editor';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

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

  const handleDelete = () => {
    removeNode(selectedNode.id);
  };

  return (
    <div className="h-full bg-muted/30 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{def?.name || selectedNode.type}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{selectedNode.type}</p>
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

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Content Editor for text-based components */}
          {selectedNode.content !== undefined && (
            <ContentEditor node={selectedNode} />
          )}

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

function ContentEditor({ node }: { node: EditorNode }) {
  const { updateNodeContent } = useEditorStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeContent(node.id, e.target.value);
    },
    [node.id, updateNodeContent]
  );

  return (
    <div className="space-y-2">
      <Label>Content</Label>
      <textarea
        value={node.content || ''}
        onChange={handleChange}
        className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
        placeholder="Enter content..."
      />
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
    case 'text':
    case 'size':
    case 'url':
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <Input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={schema.placeholder || schema.defaultValue?.toString()}
            className="h-8 text-sm"
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <Input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={schema.defaultValue?.toString()}
            className="h-8 text-sm"
          />
        </div>
      );

    case 'color':
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="color"
                value={(value as string) || schema.defaultValue || '#000000'}
                onChange={(e) => handleChange(e.target.value)}
                className="w-8 h-8 rounded border border-input cursor-pointer"
              />
            </div>
            <Input
              type="text"
              value={(value as string) || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={schema.defaultValue?.toString() || '#000000'}
              className="h-8 text-sm flex-1"
            />
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <Select
            value={(value as string) || ''}
            onValueChange={handleChange}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {schema.options?.map((option) => (
                <SelectItem key={option.value} value={option.value || 'none'}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'alignment':
      return (
        <div className="space-y-2">
          <Label className="text-xs">{schema.label}</Label>
          <div className="flex gap-1">
            <Button
              variant={value === 'left' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange('left')}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant={value === 'center' || !value ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange('center')}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant={value === 'right' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange('right')}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
