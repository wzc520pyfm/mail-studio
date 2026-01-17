/**
 * UI Store - Re-export from features/editor for backward compatibility
 * @deprecated Import from '@/features/editor' instead
 */

export {
  useUIStore,
  selectEditorMode,
  selectPreviewMode,
  selectIsDragging,
  selectActiveTab,
  useEditorMode,
  usePreviewMode,
  useIsDragging,
} from '@/features/editor/stores';
