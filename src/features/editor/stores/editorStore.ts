/**
 * Editor Store - Document state management with undo/redo support
 */

import { create } from "zustand";
import { temporal, type TemporalState } from "zundo";
import { immer } from "zustand/middleware/immer";
import type {
  EditorNode,
  MJMLComponentType,
  HeadSettings,
  FontDefinition,
} from "@/features/editor/types";
import { emptyDocument, cloneDocumentWithNewIds } from "@/features/editor/lib/mjml/templates";
import { createNode, generateId, componentDefinitions } from "@/features/editor/lib/mjml/schema";

// Default head settings
const defaultHeadSettings: HeadSettings = {
  title: "",
  preview: "",
  fonts: [],
  styles: "",
  breakpoint: "",
};

// ============ State Types ============

interface EditorState {
  // Document state
  document: EditorNode;
  selectedId: string | null;
  hoveredId: string | null;

  // Head settings
  headSettings: HeadSettings;
}

interface EditorActions {
  // Document actions
  setDocument: (document: EditorNode) => void;
  setSelectedId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;

  // Node operations
  addNode: (parentId: string, type: MJMLComponentType, index?: number) => void;
  addChildNode: (parentId: string, node: EditorNode, index?: number) => void;
  removeNode: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, props: Record<string, string | number | undefined>) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  updateNodeChildren: (nodeId: string, children: EditorNode[]) => void;
  moveNode: (nodeId: string, newParentId: string, newIndex: number) => void;
  reorderNode: (nodeId: string, targetNodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // Head settings operations
  updateHeadSettings: (settings: Partial<HeadSettings>) => void;
  addFont: (font: FontDefinition) => void;
  removeFont: (fontName: string) => void;
  updateFont: (index: number, font: FontDefinition) => void;

  // Template
  loadTemplate: (document: EditorNode) => void;

  // Helpers
  findNode: (nodeId: string) => EditorNode | null;
  findParent: (nodeId: string) => { parent: EditorNode; index: number } | null;
}

type EditorStore = EditorState & EditorActions;

// ============ Helper Functions ============

// Find a node by ID in the tree
function findNodeInTree(root: EditorNode, nodeId: string): EditorNode | null {
  if (root.id === nodeId) return root;
  if (!root.children) return null;

  for (const child of root.children) {
    const found = findNodeInTree(child, nodeId);
    if (found) return found;
  }
  return null;
}

// Find parent of a node
function findParentInTree(
  root: EditorNode,
  nodeId: string
): { parent: EditorNode; index: number } | null {
  if (!root.children) return null;

  const index = root.children.findIndex((child) => child.id === nodeId);
  if (index !== -1) {
    return { parent: root, index };
  }

  for (const child of root.children) {
    const found = findParentInTree(child, nodeId);
    if (found) return found;
  }
  return null;
}

// Deep clone a node with new IDs
function cloneNodeWithNewIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: generateId(),
    props: { ...node.props },
    children: node.children?.map(cloneNodeWithNewIds),
  };
}

// Remove locked status from a node and all its children (for duplicating)
function removeLockFromNode(node: EditorNode): void {
  delete node.locked;
  if (node.children) {
    node.children.forEach(removeLockFromNode);
  }
}

// Check if target is descendant of parent
function isDescendant(parent: EditorNode, targetId: string): boolean {
  if (parent.id === targetId) return true;
  if (!parent.children) return false;
  return parent.children.some((child) => isDescendant(child, targetId));
}

// Check if a node is locked (directly or via ancestors)
function isNodeLocked(root: EditorNode, nodeId: string): boolean {
  const node = findNodeInTree(root, nodeId);
  if (!node) return false;
  if (node.locked) return true;

  // Check if any ancestor is locked
  const checkAncestors = (current: EditorNode, targetId: string): boolean => {
    if (current.locked) return true;
    if (!current.children) return false;

    for (const child of current.children) {
      if (child.id === targetId) {
        return current.locked ?? false;
      }
      if (hasDescendant(child, targetId)) {
        return child.locked || checkAncestors(child, targetId);
      }
    }
    return false;
  };

  return checkAncestors(root, nodeId);
}

// Check if node has descendant with given id
function hasDescendant(node: EditorNode, targetId: string): boolean {
  if (node.id === targetId) return true;
  if (!node.children) return false;
  return node.children.some((child) => hasDescendant(child, targetId));
}

// Check if a node or any of its ancestors is locked
function isNodeOrAncestorLocked(root: EditorNode, nodeId: string): boolean {
  // First check if the node itself is locked
  const node = findNodeInTree(root, nodeId);
  if (node?.locked) return true;

  // Then check ancestors by traversing from root
  const checkPath = (current: EditorNode, targetId: string): boolean => {
    if (current.id === targetId) return current.locked ?? false;
    if (current.locked) return true;

    if (current.children) {
      for (const child of current.children) {
        if (child.id === targetId || hasDescendant(child, targetId)) {
          if (current.locked) return true;
          return checkPath(child, targetId);
        }
      }
    }
    return false;
  };

  return checkPath(root, nodeId);
}

// ============ Store Creation ============

export const useEditorStore = create<EditorStore>()(
  temporal(
    immer((set, get) => ({
      // Initial state
      document: cloneDocumentWithNewIds(emptyDocument),
      selectedId: null,
      hoveredId: null,
      headSettings: { ...defaultHeadSettings },

      // Document actions
      setDocument: (document) =>
        set((state) => {
          state.document = document;
        }),

      setSelectedId: (id) =>
        set((state) => {
          state.selectedId = id;
        }),

      setHoveredId: (id) =>
        set((state) => {
          state.hoveredId = id;
        }),

      // Node operations
      addNode: (parentId, type, index) =>
        set((state) => {
          // Check if parent is locked
          if (isNodeOrAncestorLocked(state.document, parentId)) return;

          const parent = findNodeInTree(state.document, parentId);
          if (!parent) return;

          // Validate that the parent can have children
          const parentDef = componentDefinitions[parent.type];
          if (!parentDef?.canHaveChildren) return;

          // Validate that the parent accepts this child type
          if (parentDef.allowedChildren && !parentDef.allowedChildren.includes(type)) {
            return;
          }

          if (!parent.children) {
            parent.children = [];
          }

          const newNode = createNode(type);

          // If adding a section, add a column by default
          if (type === "mj-section") {
            newNode.children = [createNode("mj-column")];
          }

          if (index !== undefined && index >= 0 && index <= parent.children.length) {
            parent.children.splice(index, 0, newNode);
          } else {
            parent.children.push(newNode);
          }

          state.selectedId = newNode.id;
        }),

      addChildNode: (parentId, node, index) =>
        set((state) => {
          // Check if parent is locked
          if (isNodeOrAncestorLocked(state.document, parentId)) return;

          const parent = findNodeInTree(state.document, parentId);
          if (!parent) return;

          // Validate that the parent can have children
          const parentDef = componentDefinitions[parent.type];
          if (!parentDef?.canHaveChildren) return;

          // Validate that the parent accepts this child type
          if (parentDef.allowedChildren && !parentDef.allowedChildren.includes(node.type)) {
            return;
          }

          if (!parent.children) {
            parent.children = [];
          }

          if (index !== undefined && index >= 0 && index <= parent.children.length) {
            parent.children.splice(index, 0, node);
          } else {
            parent.children.push(node);
          }

          state.selectedId = node.id;
        }),

      removeNode: (nodeId) =>
        set((state) => {
          // Check if node or its ancestors are locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;

          const parentInfo = findParentInTree(state.document, nodeId);
          if (!parentInfo) return;

          // Also check if parent is locked
          if (parentInfo.parent.locked) return;

          parentInfo.parent.children?.splice(parentInfo.index, 1);

          if (state.selectedId === nodeId) {
            state.selectedId = null;
          }
        }),

      updateNodeProps: (nodeId, props) =>
        set((state) => {
          // Check if node or its ancestors are locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;

          const node = findNodeInTree(state.document, nodeId);
          if (!node) return;

          Object.entries(props).forEach(([key, value]) => {
            if (value === undefined || value === "") {
              delete node.props[key];
            } else {
              node.props[key] = value;
            }
          });
        }),

      updateNodeContent: (nodeId, content) =>
        set((state) => {
          // Check if node or its ancestors are locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;

          const node = findNodeInTree(state.document, nodeId);
          if (!node) return;
          node.content = content;
        }),

      updateNodeChildren: (nodeId, children) =>
        set((state) => {
          // Check if node or its ancestors are locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;

          const node = findNodeInTree(state.document, nodeId);
          if (!node) return;

          // Validate that the node can have children
          const nodeDef = componentDefinitions[node.type];
          if (!nodeDef?.canHaveChildren) return;

          node.children = children;
        }),

      moveNode: (nodeId, newParentId, newIndex) =>
        set((state) => {
          // Don't move if trying to move to itself
          if (nodeId === newParentId) return;

          // Check if node, current parent, or new parent is locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;
          if (isNodeOrAncestorLocked(state.document, newParentId)) return;

          // Find and validate current parent
          const currentParentInfo = findParentInTree(state.document, nodeId);
          if (!currentParentInfo) return;

          // Check if current parent is locked
          if (currentParentInfo.parent.locked) return;

          // Find and validate new parent BEFORE removing from current position
          const newParent = findNodeInTree(state.document, newParentId);
          if (!newParent) return;

          // Get the node to be moved
          const nodeToMove = currentParentInfo.parent.children![currentParentInfo.index];

          // Validate that the new parent can have children
          const newParentDef = componentDefinitions[newParent.type];
          if (!newParentDef?.canHaveChildren) return;

          // Validate that the new parent can accept this type of child
          if (newParentDef.allowedChildren) {
            if (!newParentDef.allowedChildren.includes(nodeToMove.type)) {
              return;
            }
          }

          // Don't allow moving a node into itself or its descendants
          if (isDescendant(nodeToMove, newParentId)) return;

          // Now safe to remove from current position
          const [node] = currentParentInfo.parent.children!.splice(currentParentInfo.index, 1);

          if (!newParent.children) {
            newParent.children = [];
          }

          // Adjust index if moving within the same parent
          let adjustedIndex = newIndex;
          if (currentParentInfo.parent.id === newParentId && currentParentInfo.index < newIndex) {
            adjustedIndex = Math.max(0, newIndex - 1);
          }

          // Ensure index is within bounds
          adjustedIndex = Math.min(adjustedIndex, newParent.children.length);
          adjustedIndex = Math.max(0, adjustedIndex);

          newParent.children.splice(adjustedIndex, 0, node);
        }),

      reorderNode: (nodeId, targetNodeId) =>
        set((state) => {
          // Don't reorder if same element
          if (nodeId === targetNodeId) return;

          // Check if node or target is locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;
          if (isNodeOrAncestorLocked(state.document, targetNodeId)) return;

          // Find both nodes' parent info
          const sourceInfo = findParentInTree(state.document, nodeId);
          const targetInfo = findParentInTree(state.document, targetNodeId);

          if (!sourceInfo || !targetInfo) return;

          // Only allow reordering within the same parent
          if (sourceInfo.parent.id !== targetInfo.parent.id) return;

          // Check if parent is locked
          if (sourceInfo.parent.locked) return;

          const parent = sourceInfo.parent;
          const sourceIndex = sourceInfo.index;
          const targetIndex = targetInfo.index;

          // Don't reorder if already at the target position
          if (sourceIndex === targetIndex) return;

          // Use arrayMove pattern: remove from source and insert at target
          // This correctly handles both forward and backward moves
          parent.children!.splice(targetIndex, 0, parent.children!.splice(sourceIndex, 1)[0]);
        }),

      duplicateNode: (nodeId) =>
        set((state) => {
          // Check if node or its ancestors are locked
          if (isNodeOrAncestorLocked(state.document, nodeId)) return;

          const parentInfo = findParentInTree(state.document, nodeId);
          if (!parentInfo) return;

          // Check if parent is locked
          if (parentInfo.parent.locked) return;

          const node = parentInfo.parent.children![parentInfo.index];
          const clonedNode = cloneNodeWithNewIds(node);
          // Remove locked status from cloned node and its children
          removeLockFromNode(clonedNode);

          parentInfo.parent.children!.splice(parentInfo.index + 1, 0, clonedNode);
          state.selectedId = clonedNode.id;
        }),

      // Head settings operations
      updateHeadSettings: (settings) =>
        set((state) => {
          state.headSettings = { ...state.headSettings, ...settings };
        }),

      addFont: (font) =>
        set((state) => {
          if (!state.headSettings.fonts) {
            state.headSettings.fonts = [];
          }
          // Avoid duplicates
          const exists = state.headSettings.fonts.some((f) => f.name === font.name);
          if (!exists) {
            state.headSettings.fonts.push(font);
          }
        }),

      removeFont: (fontName) =>
        set((state) => {
          if (!state.headSettings.fonts) return;
          state.headSettings.fonts = state.headSettings.fonts.filter((f) => f.name !== fontName);
        }),

      updateFont: (index, font) =>
        set((state) => {
          if (!state.headSettings.fonts || index < 0 || index >= state.headSettings.fonts.length)
            return;
          state.headSettings.fonts[index] = font;
        }),

      loadTemplate: (document) =>
        set((state) => {
          state.document = cloneDocumentWithNewIds(document);
          state.selectedId = null;
        }),

      // Helpers
      findNode: (nodeId) => findNodeInTree(get().document, nodeId),

      findParent: (nodeId) => findParentInTree(get().document, nodeId),
    })),
    {
      limit: 50, // Keep last 50 states for undo/redo
      equality: (pastState, currentState) =>
        JSON.stringify(pastState.document) === JSON.stringify(currentState.document) &&
        JSON.stringify(pastState.headSettings) === JSON.stringify(currentState.headSettings),
    }
  )
);

// ============ Temporal Store Hook ============

export const useTemporalStore = (): TemporalState<EditorStore> => {
  return useEditorStore.temporal.getState();
};

// ============ Selectors ============

// Select document
export const selectDocument = (state: EditorStore) => state.document;

// Select selected node ID
export const selectSelectedId = (state: EditorStore) => state.selectedId;

// Select hovered node ID
export const selectHoveredId = (state: EditorStore) => state.hoveredId;

// Select head settings
export const selectHeadSettings = (state: EditorStore) => state.headSettings;

// ============ Derived State Hooks ============

// Get selected node
// Note: We subscribe to document to ensure re-render when node props change
export function useSelectedNode(): EditorNode | null {
  const selectedId = useEditorStore(selectSelectedId);
  // Subscribe to document changes so we re-render when node props are updated
  const document = useEditorStore(selectDocument);
  const findNode = useEditorStore((s) => s.findNode);
  // findNode uses the latest document state
  return selectedId ? findNode(selectedId) : null;
}

// Get node by ID
// Note: We subscribe to document to ensure re-render when node props change
export function useNode(nodeId: string | null): EditorNode | null {
  // Subscribe to document changes so we re-render when node props are updated
  const document = useEditorStore(selectDocument);
  const findNode = useEditorStore((s) => s.findNode);
  return nodeId ? findNode(nodeId) : null;
}

// Check if a node is selected
export function useIsSelected(nodeId: string): boolean {
  return useEditorStore((s) => s.selectedId === nodeId);
}

// Check if a node is hovered
export function useIsHovered(nodeId: string): boolean {
  return useEditorStore((s) => s.hoveredId === nodeId);
}

// Get undo/redo state
export function useUndoRedo() {
  const temporal = useEditorStore.temporal;
  const { undo, redo, pastStates, futureStates } = temporal.getState();

  return {
    undo,
    redo,
    canUndo: pastStates.length > 0,
    canRedo: futureStates.length > 0,
  };
}

// Check if a node is locked (directly or via ancestors)
export function useIsNodeLocked(nodeId: string): boolean {
  const document = useEditorStore(selectDocument);
  return isNodeOrAncestorLocked(document, nodeId);
}

// Check if a node has lock attribute directly (not inherited)
export function useIsNodeDirectlyLocked(nodeId: string): boolean {
  const findNode = useEditorStore((s) => s.findNode);
  const node = findNode(nodeId);
  return node?.locked ?? false;
}

// Export helper for external use
export { isNodeOrAncestorLocked };
