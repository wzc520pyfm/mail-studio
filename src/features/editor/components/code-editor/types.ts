/**
 * Type definitions for Code Editor
 */

import type { editor, IRange } from "monaco-editor";

/**
 * Represents a locked region in the code that cannot be edited
 */
export interface LockedRegion {
  startLine: number;
  endLine: number;
  startColumn: number;
  endColumn: number;
}

/**
 * State for code synchronization
 */
export interface CodeSyncState {
  editedCode: string | null;
  error: string | null;
  isDirty: boolean;
}

/**
 * Actions for code synchronization
 */
export interface CodeSyncActions {
  handleChange: (value: string | undefined) => void;
  handleSync: () => void;
  handleReset: () => void;
}

/**
 * Props for CodeEditorToolbar component
 */
export interface CodeEditorToolbarProps {
  isDirty: boolean;
  onReset: () => void;
  onSync: () => void;
}

/**
 * Props for CodeEditorBanners component
 */
export interface CodeEditorBannersProps {
  error: string | null;
  lockedWarning: string | null;
}

/**
 * Editor refs type
 */
export interface EditorRefs {
  editor: editor.IStandaloneCodeEditor | null;
  decorations: string[];
  lockedRegions: LockedRegion[];
}

export type { editor, IRange };
