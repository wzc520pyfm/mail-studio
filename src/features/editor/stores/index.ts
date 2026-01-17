/**
 * Centralized store exports
 */

// Editor store
export {
  useEditorStore,
  useTemporalStore,
  // Selectors
  selectDocument,
  selectSelectedId,
  selectHoveredId,
  selectHeadSettings,
  // Derived hooks
  useSelectedNode,
  useNode,
  useIsSelected,
  useIsHovered,
  useUndoRedo,
} from './editorStore';

// UI store
export {
  useUIStore,
  // Selectors
  selectEditorMode,
  selectPreviewMode,
  selectIsDragging,
  selectActiveTab,
  // Derived hooks
  useEditorMode,
  usePreviewMode,
  useIsDragging,
} from './uiStore';
