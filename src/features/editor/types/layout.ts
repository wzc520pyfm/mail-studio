/**
 * Layout system types
 *
 * A Layout is a reusable structural frame for emails, defining fixed regions
 * (header, footer, etc.) and named content slots where users place their content.
 * Layouts can be switched at any time while preserving user content in the slots.
 */

import type { EditorNode } from "./node";

// A region in a layout - either a fixed (locked) region or a content slot
export type LayoutRegion = LayoutFixedRegion | LayoutSlotRegion;

// Fixed region: locked content that comes with the layout (e.g., branded header/footer)
export interface LayoutFixedRegion {
  type: "fixed";
  node: EditorNode;
}

// Content slot: a named placeholder where user content lives
export interface LayoutSlotRegion {
  type: "slot";
  slotId: string;
  name: string;
  defaultChildren?: EditorNode[];
}

// Email Layout definition
export interface EmailLayout {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  bodyProps: Record<string, string | number | undefined>;
  regions: LayoutRegion[];
}
