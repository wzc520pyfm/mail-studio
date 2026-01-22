/**
 * Code Editor module exports
 */

export { CodeEditor } from "./CodeEditor";

// Re-export types for external use
export type { LockedRegion, CodeEditorToolbarProps, CodeEditorBannersProps } from "./types";

// Re-export hooks for potential reuse
export { useCodeSync, useLockedRegions } from "./hooks";

// Re-export utilities for potential reuse
export { findLockedRegions, isRangeInLockedRegion } from "./utils";
