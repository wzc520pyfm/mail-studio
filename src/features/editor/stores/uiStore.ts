/**
 * UI Store - UI state management with persistence
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EditorMode, PreviewMode, SidebarTab } from "@/features/editor/types";

// ============ State Types ============

interface UIState {
  // Panel widths
  leftPanelWidth: number;
  rightPanelWidth: number;

  // View modes
  editorMode: EditorMode;
  previewMode: PreviewMode;
  showCode: boolean;
  showPreview: boolean;

  // Active tabs
  activeTab: SidebarTab;

  // Drag state
  isDragging: boolean;
  isDraggingNewComponent: boolean;
  dragOverId: string | null;

  // Mobile panel state
  isSidebarOpen: boolean;
  isPropertiesOpen: boolean;
}

interface UIActions {
  setLeftPanelWidth: (width: number) => void;
  setRightPanelWidth: (width: number) => void;
  setEditorMode: (mode: EditorMode) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setShowCode: (show: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setActiveTab: (tab: SidebarTab) => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsDraggingNewComponent: (isDraggingNewComponent: boolean) => void;
  setDragOverId: (id: string | null) => void;
  toggleCode: () => void;
  togglePreview: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPropertiesOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleProperties: () => void;
}

type UIStore = UIState & UIActions;

// ============ Store Creation ============

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      leftPanelWidth: 280,
      rightPanelWidth: 300,
      editorMode: "canvas",
      previewMode: "desktop",
      showCode: false,
      showPreview: false,
      activeTab: "components",
      isDragging: false,
      isDraggingNewComponent: false,
      dragOverId: null,
      isSidebarOpen: false,
      isPropertiesOpen: false,

      // Actions
      setLeftPanelWidth: (width) => set({ leftPanelWidth: width }),
      setRightPanelWidth: (width) => set({ rightPanelWidth: width }),
      setEditorMode: (mode) =>
        set({ editorMode: mode, showCode: mode === "code", showPreview: mode === "preview" }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setShowCode: (show) => set({ showCode: show }),
      setShowPreview: (show) => set({ showPreview: show }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setIsDragging: (isDragging) => set({ isDragging }),
      setIsDraggingNewComponent: (isDraggingNewComponent) => set({ isDraggingNewComponent }),
      setDragOverId: (id) => set({ dragOverId: id }),
      toggleCode: () => set((state) => ({ showCode: !state.showCode })),
      togglePreview: () => set((state) => ({ showPreview: !state.showPreview })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setPropertiesOpen: (open) => set({ isPropertiesOpen: open }),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleProperties: () => set((state) => ({ isPropertiesOpen: !state.isPropertiesOpen })),
    }),
    {
      name: "mail-studio-ui-v3",
      partialize: (state) => ({
        editorMode: state.editorMode,
        previewMode: state.previewMode,
      }),
    }
  )
);

// ============ Selectors ============

export const selectEditorMode = (state: UIStore) => state.editorMode;
export const selectPreviewMode = (state: UIStore) => state.previewMode;
export const selectIsDragging = (state: UIStore) => state.isDragging;
export const selectIsDraggingNewComponent = (state: UIStore) => state.isDraggingNewComponent;
export const selectActiveTab = (state: UIStore) => state.activeTab;
export const selectIsSidebarOpen = (state: UIStore) => state.isSidebarOpen;
export const selectIsPropertiesOpen = (state: UIStore) => state.isPropertiesOpen;

// ============ Derived State Hooks ============

export function useEditorMode(): EditorMode {
  return useUIStore(selectEditorMode);
}

export function usePreviewMode(): PreviewMode {
  return useUIStore(selectPreviewMode);
}

export function useIsDragging(): boolean {
  return useUIStore(selectIsDragging);
}
