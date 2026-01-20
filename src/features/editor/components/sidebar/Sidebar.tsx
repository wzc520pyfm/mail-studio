/**
 * Sidebar component with tabs for components and templates
 */

"use client";

import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUIStore } from "@/features/editor/stores";
import type { SidebarTab } from "@/features/editor/types";
import { ComponentsPanel } from "./ComponentsPanel";
import { TemplatesPanel } from "./TemplatesPanel";

interface SidebarProps {
  idPrefix?: string;
}

export const Sidebar = memo(function Sidebar({ idPrefix = "" }: SidebarProps) {
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);

  return (
    <div className="h-full bg-muted/30 flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as SidebarTab)}
        className="flex-1 flex flex-col overflow-y-auto"
      >
        <div className="px-3 pt-3 pb-2">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="components" className="text-xs">
              Components
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs">
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="components" className="flex-1 mt-0 overflow-hidden">
          <ComponentsPanel idPrefix={idPrefix} />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 mt-0 overflow-hidden">
          <TemplatesPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
});
