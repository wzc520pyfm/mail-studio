/**
 * Edit Mode - Document-style email editor
 *
 * Provides a Google Docs-like editing experience for MJML emails.
 */

"use client";

import { useState } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode, MJMLComponentType } from "@/features/editor/types";
import { generateId } from "@/features/editor/lib/mjml";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { LayoutGrid } from "lucide-react";
import { SortableSectionContainer, AddSectionButton } from "./components";

export function EditMode() {
  const document = useEditorStore((s) => s.document);
  const addChildNode = useEditorStore((s) => s.addChildNode);
  const updateNodeChildren = useEditorStore((s) => s.updateNodeChildren);
  const [activeSectionId, setActiveSectionId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sectionIds = document.children?.map((section) => section.id) || [];

  const handleSectionDragStart = (event: DragStartEvent) => {
    setActiveSectionId(event.active.id);
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSectionId(null);

    if (over && active.id !== over.id && document.children) {
      const oldIndex = sectionIds.indexOf(active.id as string);
      const newIndex = sectionIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newChildren = arrayMove(document.children, oldIndex, newIndex);
        updateNodeChildren(document.id, newChildren);
      }
    }
  };

  const activeSection = activeSectionId
    ? document.children?.find((section) => section.id === activeSectionId)
    : null;

  const handleAddSection = (columnCount: number = 1) => {
    const columns: EditorNode[] = Array.from({ length: columnCount }, () => ({
      id: generateId(),
      type: "mj-column" as MJMLComponentType,
      props: { width: `${Math.floor(100 / columnCount)}%` },
      children: [],
    }));

    const newSection: EditorNode = {
      id: generateId(),
      type: "mj-section",
      props: { padding: "20px 0", "background-color": "#ffffff" },
      children: columns,
    };

    addChildNode(document.id, newSection);
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-[650px] mx-auto py-12 px-8">
        {/* Email Header */}
        <EmailHeader />

        {/* Email Body */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleSectionDragStart}
          onDragEnd={handleSectionDragEnd}
        >
          <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {document.children?.map((section) => (
                <SortableSectionContainer key={section.id} node={section} />
              ))}
              <AddSectionButton onAddSection={handleAddSection} />
            </div>
          </SortableContext>
          <DragOverlay>
            {activeSection ? (
              <div className="bg-white rounded-lg shadow-xl border-2 border-blue-400 opacity-90 p-4">
                <div className="text-center text-gray-500 text-sm">
                  <LayoutGrid className="w-5 h-5 mx-auto mb-1" />
                  Section ({activeSection.children?.length || 0} columns)
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

// Email header component
function EmailHeader() {
  return (
    <div className="mb-8 pb-6 border-b border-gray-200">
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span className="w-16">From</span>
        <input
          type="text"
          placeholder="Your Name <email@example.com>"
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <span className="w-16">To</span>
        <input
          type="text"
          placeholder="Recipient(s)"
          className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
        />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="w-16">Subject</span>
        <input
          type="text"
          placeholder="Email subject"
          className="flex-1 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}
