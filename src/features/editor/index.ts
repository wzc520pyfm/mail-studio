/**
 * Editor feature - main entry point
 *
 * This feature module contains all the code related to the email editor,
 * organized following React best practices:
 *
 * - components/ - React components organized by feature area
 * - hooks/ - Custom hooks for reusable logic
 * - stores/ - Zustand stores for state management
 * - types/ - TypeScript type definitions
 * - lib/ - Utilities and business logic
 */

// Components
export { Editor } from "./components";

// Stores
export {
  useEditorStore,
  useTemporalStore,
  useUIStore,
  useSelectedNode,
  useNode,
  useIsSelected,
  useIsHovered,
  useUndoRedo,
  useEditorMode,
  usePreviewMode,
  useIsDragging,
} from "./stores";

// Hooks
export {
  useDragState,
  useNodeSelection,
  useNodeActions,
  useKeyboardShortcuts,
  useBreadcrumb,
} from "./hooks";

// Types
export type {
  MJMLComponentType,
  EditorNode,
  HeadSettings,
  Template,
  ComponentDefinition,
  PropSchema,
  EditorMode,
  PreviewMode,
  DragState,
} from "./types";

// Lib
export {
  componentDefinitions,
  componentCategories,
  createNode,
  generateId,
  compileDocument,
  generateMjml,
  templates,
  cloneDocumentWithNewIds,
} from "./lib/mjml";
