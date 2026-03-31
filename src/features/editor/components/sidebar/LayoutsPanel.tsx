/**
 * Layouts panel showing available email layouts with switch support
 */

"use client";

import { memo, useCallback, useState } from "react";
import { LayoutTemplate, Check, Unlink } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLayoutStore, useActiveLayoutId } from "@/features/editor/stores";
import { emailLayouts } from "@/features/editor/lib/mjml/layouts";
import type { EmailLayout } from "@/features/editor/types";
import { cn } from "@/lib/utils";

// Color mapping for layout categories
const categoryColors: Record<string, string> = {
  business: "from-blue-500/20 to-blue-600/10",
  creative: "from-gray-400/20 to-gray-500/10",
  marketing: "from-red-500/20 to-red-600/10",
};

// Layout card mini-preview: renders a simplified visual representation of the regions
function LayoutMiniPreview({ layout }: { layout: EmailLayout }) {
  return (
    <div className="w-full h-20 rounded border border-border/50 overflow-hidden flex flex-col bg-white">
      {layout.regions.map((region, i) => {
        if (region.type === "fixed") {
          return (
            <div
              key={i}
              className="flex-shrink-0 h-3 mx-1 mt-0.5 rounded-sm"
              style={{
                backgroundColor: (region.node.props["background-color"] as string) || "#64748b",
                opacity: 0.8,
              }}
            />
          );
        }
        return (
          <div
            key={i}
            className="flex-1 mx-1 my-0.5 rounded-sm border border-dashed border-gray-300 flex items-center justify-center"
          >
            <span className="text-[8px] text-gray-400">{region.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export const LayoutsPanel = memo(function LayoutsPanel() {
  const activeLayoutId = useActiveLayoutId();
  const applyLayout = useLayoutStore((s) => s.applyLayout);
  const switchLayout = useLayoutStore((s) => s.switchLayout);
  const replaceWithLayout = useLayoutStore((s) => s.replaceWithLayout);
  const detachLayout = useLayoutStore((s) => s.detachLayout);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detachDialogOpen, setDetachDialogOpen] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<EmailLayout | null>(null);

  const handleSelectLayout = useCallback(
    (layout: EmailLayout) => {
      if (layout.id === activeLayoutId) return;

      if (activeLayoutId) {
        // Already have a layout — show switch confirmation
        setPendingLayout(layout);
        setDialogOpen(true);
      } else {
        // No active layout — apply directly
        applyLayout(layout.id);
      }
    },
    [activeLayoutId, applyLayout]
  );

  const handleConfirmSwitch = useCallback(() => {
    if (pendingLayout) {
      switchLayout(pendingLayout.id);
    }
    setDialogOpen(false);
    setPendingLayout(null);
  }, [pendingLayout, switchLayout]);

  const handleReplaceAll = useCallback(() => {
    if (pendingLayout) {
      replaceWithLayout(pendingLayout.id);
    }
    setDialogOpen(false);
    setPendingLayout(null);
  }, [pendingLayout, replaceWithLayout]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
    setPendingLayout(null);
  }, []);

  const handleDetach = useCallback(() => {
    setDetachDialogOpen(true);
  }, []);

  const handleConfirmDetach = useCallback(() => {
    detachLayout();
    setDetachDialogOpen(false);
  }, [detachLayout]);

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-3 space-y-3">
          {/* Active layout indicator */}
          {activeLayoutId && (
            <div className="p-2.5 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {emailLayouts.find((l) => l.id === activeLayoutId)?.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                  onClick={handleDetach}
                  title="Detach layout"
                >
                  <Unlink className="w-3 h-3 mr-1" />
                  Detach
                </Button>
              </div>
            </div>
          )}

          {/* Layout cards */}
          {emailLayouts.map((layout) => {
            const isActive = layout.id === activeLayoutId;
            return (
              <button
                key={layout.id}
                onClick={() => handleSelectLayout(layout)}
                className={cn(
                  "w-full p-3 rounded-lg border text-left transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  isActive
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-background hover:border-primary/50 hover:bg-accent/50"
                )}
              >
                <div className="space-y-2">
                  <LayoutMiniPreview layout={layout} />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1.5">
                        {layout.name}
                        {isActive && <Check className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {layout.category}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-md flex items-center justify-center bg-gradient-to-br",
                        categoryColors[layout.category] || "from-muted to-muted-foreground/20"
                      )}
                    >
                      <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Detach Layout Warning Dialog */}
      <Dialog open={detachDialogOpen} onOpenChange={setDetachDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Detach Layout</DialogTitle>
            <DialogDescription>
              Are you sure you want to detach{" "}
              <span className="font-medium text-foreground">
                {emailLayouts.find((l) => l.id === activeLayoutId)?.name}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive space-y-1">
            <p>
              All fixed regions (header, footer, etc.) from this layout will be{" "}
              <strong>permanently removed</strong>. Only your editable content will be kept.
            </p>
            <p>This action can be undone with Ctrl+Z.</p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetachDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDetach}>
              Detach
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Switch Layout Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch Layout</DialogTitle>
            <DialogDescription>
              You are switching from{" "}
              <span className="font-medium text-foreground">
                {emailLayouts.find((l) => l.id === activeLayoutId)?.name}
              </span>{" "}
              to <span className="font-medium text-foreground">{pendingLayout?.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Current layout preview */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">Current</div>
                {activeLayoutId && (
                  <LayoutMiniPreview layout={emailLayouts.find((l) => l.id === activeLayoutId)!} />
                )}
              </div>
              {/* New layout preview */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground">New</div>
                {pendingLayout && <LayoutMiniPreview layout={pendingLayout} />}
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Switch Style</strong> — Replace only the fixed regions (header, footer,
                etc.) while keeping your content intact.
              </p>
              <p>
                <strong>Replace All</strong> — Replace the entire email with the new layout&apos;s
                default content.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCancel} className="sm:mr-auto">
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleReplaceAll}>
              Replace All
            </Button>
            <Button onClick={handleConfirmSwitch}>Switch Style</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});
