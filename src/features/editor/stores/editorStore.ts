/**
 * Editor Store - Document state management with undo/redo support
 */

import { create } from 'zustand';
import { temporal, type TemporalState } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import type { EditorNode, MJMLComponentType, HeadSettings, FontDefinition } from '@/features/editor/types';
import { emptyDocument, cloneDocumentWithNewIds } from '@/features/editor/lib/mjml/templates';
import { createNode, generateId, componentDefinitions } from '@/features/editor/lib/mjml/schema';

// Default head settings
const defaultHeadSettings: HeadSettings = {
  title: '',
  preview: '',
  fonts: [],
  styles: '',
  breakpoint: '',
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

// Check if target is descendant of parent
function isDescendant(parent: EditorNode, targetId: string): boolean {
  if (parent.id === targetId) return true;
  if (!parent.children) return false;
  return parent.children.some((child) => isDescendant(child, targetId));
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
          if (type === 'mj-section') {
            newNode.children = [createNode('mj-column')];
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
          const parentInfo = findParentInTree(state.document, nodeId);
          if (!parentInfo) return;

          parentInfo.parent.children?.splice(parentInfo.index, 1);

          if (state.selectedId === nodeId) {
            state.selectedId = null;
          }
        }),

      updateNodeProps: (nodeId, props) =>
        set((state) => {
          const node = findNodeInTree(state.document, nodeId);
          if (!node) return;

          Object.entries(props).forEach(([key, value]) => {
            if (value === undefined || value === '') {
              delete node.props[key];
            } else {
              node.props[key] = value;
            }
          });
        }),

      updateNodeContent: (nodeId, content) =>
        set((state) => {
          const node = findNodeInTree(state.document, nodeId);
          if (!node) return;
          node.content = content;
        }),

      updateNodeChildren: (nodeId, children) =>
        set((state) => {
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

          // Find and validate current parent
          const currentParentInfo = findParentInTree(state.document, nodeId);
          if (!currentParentInfo) return;

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

      duplicateNode: (nodeId) =>
        set((state) => {
          const parentInfo = findParentInTree(state.document, nodeId);
          if (!parentInfo) return;

          const node = parentInfo.parent.children![parentInfo.index];
          const clonedNode = cloneNodeWithNewIds(node);

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
export function useSelectedNode(): EditorNode | null {
  const selectedId = useEditorStore(selectSelectedId);
  const findNode = useEditorStore((s) => s.findNode);
  return selectedId ? findNode(selectedId) : null;
}

// Get node by ID
export function useNode(nodeId: string | null): EditorNode | null {
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
