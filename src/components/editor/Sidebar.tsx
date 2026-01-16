'use client';

import { useDraggable } from '@dnd-kit/core';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUIStore } from '@/stores/ui';
import { useEditorStore } from '@/stores/editor';
import { componentCategories, componentDefinitions } from '@/lib/mjml/schema';
import { templates, cloneDocumentWithNewIds } from '@/lib/mjml/templates';
import { MJMLComponentType } from '@/types/editor';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <div className="h-full bg-muted/30 flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'components' | 'templates')}
        className="flex-1 flex flex-col"
      >
        <div className="px-3 pt-3 pb-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="components" className="flex-1 mt-0 overflow-hidden">
          <ComponentsPanel />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-0 overflow-hidden">
          <TemplatesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Category icons mapping
const categoryIcons: Record<string, keyof typeof Icons> = {
  layout: 'LayoutGrid',
  content: 'FileText',
  interactive: 'MousePointerClick',
  social: 'Share2',
};

function ComponentsPanel() {
  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {componentCategories.map((category) => {
          const IconComponent = Icons[categoryIcons[category.id] || 'Box'] as React.ElementType;
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
}

function DraggableComponent({ type }: { type: MJMLComponentType }) {
  const def = componentDefinitions[type];
  const IconComponent = Icons[def.icon as keyof typeof Icons] as React.ElementType;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: {
      type: 'new-component',
      componentType: type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border border-border bg-background',
        'cursor-grab active:cursor-grabbing transition-all duration-200',
        'hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm',
        'min-h-[70px]',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      {IconComponent && (
        <IconComponent className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
      <span className="text-xs font-medium text-center leading-tight">{def.name}</span>
    </div>
  );
}

function TemplatesPanel() {
  const { loadTemplate } = useEditorStore();

  const handleSelectTemplate = (document: typeof templates[0]['document']) => {
    loadTemplate(cloneDocumentWithNewIds(document));
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template.document)}
            className={cn(
              'w-full p-3 rounded-lg border border-border bg-background text-left',
              'hover:border-primary/50 hover:bg-accent/50 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                <Icons.FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {template.category}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
