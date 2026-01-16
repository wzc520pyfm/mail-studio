'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useEditorStore } from '@/stores/editor';
import { Settings, Plus, Trash2, Type, Eye, Palette, Ruler } from 'lucide-react';

export function HeadSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Email Settings</SheetTitle>
          <SheetDescription>
            Configure email metadata, fonts, and custom styles
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-4 pr-4">
          <HeadSettingsPanel />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function HeadSettingsPanel() {
  const { headSettings, updateHeadSettings, addFont, removeFont, updateFont } = useEditorStore();

  return (
    <Accordion type="multiple" defaultValue={['metadata', 'fonts', 'styles', 'responsive']} className="space-y-2">
      {/* Metadata Section */}
      <AccordionItem value="metadata" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-muted-foreground" />
            <span>Metadata</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs">Email Title</Label>
            <Input
              id="title"
              value={headSettings.title || ''}
              onChange={(e) => updateHeadSettings({ title: e.target.value })}
              placeholder="My Email Newsletter"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Sets the document title and accessibility label
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preview" className="text-xs flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Preview Text
            </Label>
            <textarea
              id="preview"
              value={headSettings.preview || ''}
              onChange={(e) => updateHeadSettings({ preview: e.target.value })}
              placeholder="This text appears in email clients as a preview..."
              className="w-full min-h-[60px] px-3 py-2 text-sm rounded-md border border-input bg-background resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Shown as preview text in inbox before opening the email
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Custom Fonts Section */}
      <AccordionItem value="fonts" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span>Custom Fonts</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          <p className="text-xs text-muted-foreground">
            Add web fonts from Google Fonts or other providers
          </p>
          
          {headSettings.fonts && headSettings.fonts.length > 0 && (
            <div className="space-y-3">
              {headSettings.fonts.map((font, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={font.name}
                      onChange={(e) => updateFont(index, { ...font, name: e.target.value })}
                      placeholder="Font Name (e.g., Roboto)"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={font.href}
                      onChange={(e) => updateFont(index, { ...font, href: e.target.value })}
                      placeholder="https://fonts.googleapis.com/css?family=Roboto"
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeFont(font.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => addFont({ name: '', href: '' })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Font
          </Button>

          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Popular Google Fonts URLs:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-0.5">
              <li>• Roboto: fonts.googleapis.com/css?family=Roboto</li>
              <li>• Open Sans: fonts.googleapis.com/css?family=Open+Sans</li>
              <li>• Lato: fonts.googleapis.com/css?family=Lato</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Custom Styles Section */}
      <AccordionItem value="styles" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <span>Custom Styles</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="styles" className="text-xs">CSS Styles</Label>
            <textarea
              id="styles"
              value={headSettings.styles || ''}
              onChange={(e) => updateHeadSettings({ styles: e.target.value })}
              placeholder={`.custom-class {
  color: #333;
  font-weight: bold;
}

a.link {
  color: #0066cc;
}`}
              className="w-full min-h-[150px] px-3 py-2 text-sm font-mono rounded-md border border-input bg-background resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Add custom CSS classes that can be used in your email content
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Responsive Section */}
      <AccordionItem value="responsive" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-muted-foreground" />
            <span>Responsive</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="breakpoint" className="text-xs">Mobile Breakpoint</Label>
            <Input
              id="breakpoint"
              value={headSettings.breakpoint || ''}
              onChange={(e) => updateHeadSettings({ breakpoint: e.target.value })}
              placeholder="480px"
              className="h-8 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Width at which the email switches to mobile layout (default: 480px)
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default HeadSettingsPanel;
