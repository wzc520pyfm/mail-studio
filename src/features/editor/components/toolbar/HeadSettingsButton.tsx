/**
 * Head settings button with dialog
 */

'use client';

import { memo, useCallback, useState } from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/features/editor/stores';

export const HeadSettingsButton = memo(function HeadSettingsButton() {
  const headSettings = useEditorStore((s) => s.headSettings);
  const updateHeadSettings = useEditorStore((s) => s.updateHeadSettings);
  const addFont = useEditorStore((s) => s.addFont);
  const removeFont = useEditorStore((s) => s.removeFont);

  const [newFontName, setNewFontName] = useState('');
  const [newFontHref, setNewFontHref] = useState('');

  const handleAddFont = useCallback(() => {
    if (newFontName && newFontHref) {
      addFont({ name: newFontName, href: newFontHref });
      setNewFontName('');
      setNewFontHref('');
    }
  }, [newFontName, newFontHref, addFont]);

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Head Settings</TooltipContent>
      </Tooltip>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Email Head Settings</DialogTitle>
          <DialogDescription>
            Configure email metadata, fonts, and global styles.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Email Title</Label>
              <Input
                id="title"
                value={headSettings.title || ''}
                onChange={(e) => updateHeadSettings({ title: e.target.value })}
                placeholder="My Email Title"
              />
              <p className="text-xs text-muted-foreground">
                The title that appears in the browser tab
              </p>
            </div>

            {/* Preview Text */}
            <div className="space-y-2">
              <Label htmlFor="preview">Preview Text</Label>
              <Input
                id="preview"
                value={headSettings.preview || ''}
                onChange={(e) => updateHeadSettings({ preview: e.target.value })}
                placeholder="Preview text shown in email clients..."
              />
              <p className="text-xs text-muted-foreground">
                Text shown in email preview before opening
              </p>
            </div>

            <Separator />

            {/* Custom Fonts */}
            <div className="space-y-3">
              <Label>Custom Fonts</Label>
              <p className="text-xs text-muted-foreground">
                Add Google Fonts or other web fonts
              </p>

              {/* Existing fonts */}
              {headSettings.fonts && headSettings.fonts.length > 0 && (
                <div className="space-y-2">
                  {headSettings.fonts.map((font) => (
                    <div key={font.name} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <span className="flex-1 text-sm font-medium truncate">{font.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => removeFont(font.name)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new font */}
              <div className="space-y-2 p-3 border border-dashed rounded-lg">
                <Input
                  placeholder="Font name (e.g., Open Sans)"
                  value={newFontName}
                  onChange={(e) => setNewFontName(e.target.value)}
                  className="h-8 text-sm"
                />
                <Input
                  placeholder="Font URL (Google Fonts URL)"
                  value={newFontHref}
                  onChange={(e) => setNewFontHref(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleAddFont}
                  disabled={!newFontName || !newFontHref}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Font
                </Button>
              </div>
            </div>

            <Separator />

            {/* Breakpoint */}
            <div className="space-y-2">
              <Label htmlFor="breakpoint">Mobile Breakpoint</Label>
              <Input
                id="breakpoint"
                value={headSettings.breakpoint || ''}
                onChange={(e) => updateHeadSettings({ breakpoint: e.target.value })}
                placeholder="480px"
              />
              <p className="text-xs text-muted-foreground">
                Screen width for mobile layout (default: 480px)
              </p>
            </div>

            {/* Custom Styles */}
            <div className="space-y-2">
              <Label htmlFor="styles">Custom CSS</Label>
              <textarea
                id="styles"
                value={headSettings.styles || ''}
                onChange={(e) => updateHeadSettings({ styles: e.target.value })}
                placeholder=".custom-class { color: red; }"
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background font-mono resize-y"
              />
              <p className="text-xs text-muted-foreground">
                Additional CSS styles for the email
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});
