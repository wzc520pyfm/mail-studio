/**
 * Layout Store - Manages the layout system for template switching
 *
 * The layout system allows users to switch email "frames" (header, footer, etc.)
 * while preserving their editable content in named slots.
 */

import { create } from "zustand";
import type { EditorNode, EmailLayout } from "@/features/editor/types";
import { cloneDocumentWithNewIds } from "@/features/editor/lib/mjml/templates";
import { getLayoutById } from "@/features/editor/lib/mjml/layouts";
import { useEditorStore } from "./editorStore";

// ============ Helper Functions ============

/**
 * Extract user content from the current document, grouped by layoutSlot.
 * Non-locked top-level sections with a layoutSlot are considered user content.
 * Non-locked sections without a layoutSlot are collected under "__unslotted__".
 */
function extractSlotContent(document: EditorNode): Map<string, EditorNode[]> {
  const slotMap = new Map<string, EditorNode[]>();

  if (!document.children) return slotMap;

  for (const child of document.children) {
    // Skip locked (layout-owned) sections
    if (child.locked) continue;

    const slotId = child.layoutSlot ?? "__unslotted__";
    if (!slotMap.has(slotId)) {
      slotMap.set(slotId, []);
    }
    slotMap.get(slotId)!.push(child);
  }

  return slotMap;
}

/**
 * Clone an EditorNode deeply with new IDs, preserving locked state.
 * Uses the existing cloneDocumentWithNewIds utility.
 */
function cloneNode(node: EditorNode): EditorNode {
  return cloneDocumentWithNewIds(node);
}

/**
 * Clone an array of EditorNodes, assigning them to a specific layoutSlot.
 */
function cloneNodesWithSlot(nodes: EditorNode[], slotId: string): EditorNode[] {
  return nodes.map((node) => {
    const cloned = cloneNode(node);
    cloned.layoutSlot = slotId;
    // Remove locked flag from user content (safety measure)
    delete cloned.locked;
    return cloned;
  });
}

/**
 * Build a document from a layout definition and slot content.
 *
 * For each region in the layout:
 * - "fixed" → insert locked section from the layout (with new IDs)
 * - "slot"  → insert user content for that slotId, or default content if empty
 */
function buildDocumentFromLayout(
  layout: EmailLayout,
  slotContent: Map<string, EditorNode[]>
): EditorNode {
  const children: EditorNode[] = [];

  for (const region of layout.regions) {
    if (region.type === "fixed") {
      // Clone the fixed node with new IDs, ensure it's locked
      const fixedNode = cloneNode(region.node);
      fixedNode.locked = true;
      children.push(fixedNode);
    } else {
      // Slot region: use existing user content or fall back to defaults
      const userContent = slotContent.get(region.slotId);

      if (userContent && userContent.length > 0) {
        // Re-clone user content and tag with new layout's slotId
        const slottedNodes = cloneNodesWithSlot(userContent, region.slotId);
        children.push(...slottedNodes);
      } else {
        // Use default content for this slot
        if (region.defaultChildren && region.defaultChildren.length > 0) {
          const defaults = region.defaultChildren.map((node) => {
            const cloned = cloneNode(node);
            cloned.layoutSlot = region.slotId;
            delete cloned.locked;
            return cloned;
          });
          children.push(...defaults);
        }
      }
    }
  }

  // Handle orphan content: user content from slots not present in new layout
  const layoutSlotIds = new Set(
    layout.regions.filter((r) => r.type === "slot").map((r) => (r as { slotId: string }).slotId)
  );

  // Find the last slot in the layout to append orphans
  const lastSlotId = [...layoutSlotIds].pop();

  for (const [slotId, nodes] of slotContent.entries()) {
    if (slotId === "__unslotted__" || !layoutSlotIds.has(slotId)) {
      // Orphan content - append to the last slot, or just append at end
      const targetSlot = lastSlotId ?? "main";
      const orphans = cloneNodesWithSlot(nodes, targetSlot);
      children.push(...orphans);
    }
  }

  return {
    id: `root_${Date.now()}`,
    type: "mj-body",
    props: { ...layout.bodyProps },
    children,
  };
}

// ============ State Types ============

interface LayoutState {
  activeLayoutId: string | null;
}

interface LayoutActions {
  /**
   * Apply a layout to the current document.
   * All existing non-locked content becomes the "main" slot content.
   */
  applyLayout: (layoutId: string) => void;

  /**
   * Switch from the current layout to a new one.
   * Preserves user content in matching slots, replaces fixed regions.
   */
  switchLayout: (layoutId: string) => void;

  /**
   * Replace the entire document with a new layout and its default content.
   * Discards all existing user content.
   */
  replaceWithLayout: (layoutId: string) => void;

  /**
   * Detach the active layout.
   * Removes locked regions and clears all layout metadata.
   * The document becomes a free-form editable document.
   */
  detachLayout: () => void;

  /**
   * Get the currently active layout definition, or null.
   */
  getActiveLayout: () => EmailLayout | null;
}

type LayoutStore = LayoutState & LayoutActions;

// ============ Store Creation ============

export const useLayoutStore = create<LayoutStore>()((set, get) => ({
  activeLayoutId: null,

  applyLayout: (layoutId: string) => {
    const layout = getLayoutById(layoutId);
    if (!layout) return;

    const editorStore = useEditorStore.getState();
    const currentDoc = editorStore.document;

    // Collect all existing non-locked children as "main" slot content
    const slotContent = new Map<string, EditorNode[]>();
    const mainContent: EditorNode[] = [];

    if (currentDoc.children) {
      for (const child of currentDoc.children) {
        if (!child.locked) {
          mainContent.push(child);
        }
      }
    }

    if (mainContent.length > 0) {
      slotContent.set("main", mainContent);
    }

    // Build new document
    const newDocument = buildDocumentFromLayout(layout, slotContent);

    // Update editor store
    editorStore.setDocument(newDocument);
    set({ activeLayoutId: layoutId });
  },

  switchLayout: (layoutId: string) => {
    const layout = getLayoutById(layoutId);
    if (!layout) return;

    const editorStore = useEditorStore.getState();
    const currentDoc = editorStore.document;

    // Extract user content grouped by slot
    const slotContent = extractSlotContent(currentDoc);

    // Build new document with the new layout + preserved content
    const newDocument = buildDocumentFromLayout(layout, slotContent);

    // Update editor store
    editorStore.setDocument(newDocument);
    set({ activeLayoutId: layoutId });
  },

  replaceWithLayout: (layoutId: string) => {
    const layout = getLayoutById(layoutId);
    if (!layout) return;

    const editorStore = useEditorStore.getState();

    // Build new document with empty slot content → all slots get defaults
    const newDocument = buildDocumentFromLayout(layout, new Map());

    // Update editor store
    editorStore.setDocument(newDocument);
    set({ activeLayoutId: layoutId });
  },

  detachLayout: () => {
    const editorStore = useEditorStore.getState();
    const currentDoc = editorStore.document;

    if (!currentDoc.children) {
      set({ activeLayoutId: null });
      return;
    }

    // Keep only non-locked children, remove layoutSlot tags
    const newChildren = currentDoc.children
      .filter((child) => !child.locked)
      .map((child) => {
        const cleaned = { ...child };
        delete cleaned.layoutSlot;
        return cleaned;
      });

    const newDocument: EditorNode = {
      ...currentDoc,
      children: newChildren,
    };

    editorStore.setDocument(newDocument);
    set({ activeLayoutId: null });
  },

  getActiveLayout: () => {
    const { activeLayoutId } = get();
    if (!activeLayoutId) return null;
    return getLayoutById(activeLayoutId) ?? null;
  },
}));

// ============ Selectors ============

export const selectActiveLayoutId = (state: LayoutStore) => state.activeLayoutId;

// ============ Derived Hooks ============

export function useActiveLayoutId(): string | null {
  return useLayoutStore(selectActiveLayoutId);
}

export function useActiveLayout(): EmailLayout | null {
  const id = useActiveLayoutId();
  if (!id) return null;
  return getLayoutById(id) ?? null;
}

export function useHasActiveLayout(): boolean {
  return useLayoutStore((s) => s.activeLayoutId !== null);
}
