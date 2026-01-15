import { create } from 'zustand';
import { temporal } from 'zundo';
import { immer } from 'zustand/middleware/immer';
import { EditorNode, MJMLComponentType } from '@/types/editor';
import { emptyDocument, cloneDocumentWithNewIds } from '@/lib/mjml/templates';
import { createNode, generateId } from '@/lib/mjml/schema';

interface EditorState {
  // Document state
  document: EditorNode;
  selectedId: string | null;
  hoveredId: string | null;

  // Actions
  setDocument: (document: EditorNode) => void;
  setSelectedId: (id: string | null) => void;
  setHoveredId: (id: string | null) => void;

  // Node operations
  addNode: (parentId: string, type: MJMLComponentType, index?: number) => void;
  removeNode: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, props: Record<string, string | number | undefined>) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  moveNode: (nodeId: string, newParentId: string, newIndex: number) => void;
  duplicateNode: (nodeId: string) => void;

  // Template
  loadTemplate: (document: EditorNode) => void;

  // Helpers
  findNode: (nodeId: string) => EditorNode | null;
  findParent: (nodeId: string) => { parent: EditorNode; index: number } | null;
}

// Helper function to find a node by ID in the tree
function findNodeInTree(root: EditorNode, nodeId: string): EditorNode | null {
  if (root.id === nodeId) return root;
  if (!root.children) return null;

  for (const child of root.children) {
    const found = findNodeInTree(child, nodeId);
    if (found) return found;
  }
  return null;
}

// Helper function to find parent of a node
function findParentInTree(root: EditorNode, nodeId: string): { parent: EditorNode; index: number } | null {
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

// Helper function to deep clone a node with new IDs
function cloneNodeWithNewIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: generateId(),
    props: { ...node.props },
    children: node.children?.map(cloneNodeWithNewIds),
  };
}

export const useEditorStore = create<EditorState>()(
  temporal(
    immer((set, get) => ({
      document: cloneDocumentWithNewIds(emptyDocument),
      selectedId: null,
      hoveredId: null,

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

      addNode: (parentId, type, index) =>
        set((state) => {
          const parent = findNodeInTree(state.document, parentId);
          if (!parent) return;

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

      moveNode: (nodeId, newParentId, newIndex) =>
        set((state) => {
          // Find and remove from current position
          const currentParentInfo = findParentInTree(state.document, nodeId);
          if (!currentParentInfo) return;

          const [node] = currentParentInfo.parent.children!.splice(currentParentInfo.index, 1);

          // Find new parent and insert
          const newParent = findNodeInTree(state.document, newParentId);
          if (!newParent) return;

          if (!newParent.children) {
            newParent.children = [];
          }

          // Adjust index if moving within the same parent
          let adjustedIndex = newIndex;
          if (currentParentInfo.parent.id === newParentId && currentParentInfo.index < newIndex) {
            adjustedIndex = Math.max(0, newIndex - 1);
          }

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

      loadTemplate: (document) =>
        set((state) => {
          state.document = cloneDocumentWithNewIds(document);
          state.selectedId = null;
        }),

      findNode: (nodeId) => findNodeInTree(get().document, nodeId),

      findParent: (nodeId) => findParentInTree(get().document, nodeId),
    })),
    {
      limit: 50, // Keep last 50 states for undo/redo
      equality: (pastState, currentState) =>
        JSON.stringify(pastState.document) === JSON.stringify(currentState.document),
    }
  )
);

// Export temporal controls for undo/redo
export const useTemporalStore = () => useEditorStore.temporal;
