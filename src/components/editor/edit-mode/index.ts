/**
 * Edit Mode - Document-style email editor
 *
 * This module provides a Google Docs-like editing experience for MJML emails.
 *
 * Directory structure:
 * - EditMode.tsx: Main component with section drag-drop
 * - components/: Reusable edit mode components
 *   - blocks/: Editable content block components (Text, Image, Button, etc.)
 *   - SectionContainer.tsx: Section with column drag-drop
 *   - ColumnContainer.tsx: Column with block drag-drop
 *   - HeroContainer.tsx: Hero section component
 *   - EditBlock.tsx: Block wrapper with controls
 *   - AddSectionButton.tsx: Add section popover
 *   - AddBlockButton.tsx: Add block popover
 * - types.ts: Shared TypeScript types
 */

export { EditMode } from "./EditMode";
export * from "./components";
export * from "./types";
