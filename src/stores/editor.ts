/**
 * Editor Store - Re-export from features/editor for backward compatibility
 * @deprecated Import from '@/features/editor' instead
 */

export {
  useEditorStore,
  useTemporalStore,
  selectDocument,
  selectSelectedId,
  selectHoveredId,
  selectHeadSettings,
  useSelectedNode,
  useNode,
  useIsSelected,
  useIsHovered,
  useUndoRedo,
} from "@/features/editor/stores";
