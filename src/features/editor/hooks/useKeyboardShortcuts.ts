/**
 * Hook for keyboard shortcuts in the editor
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useEditorStore, useUndoRedo } from '@/features/editor/stores';

export function useKeyboardShortcuts() {
  const selectedId = useEditorStore((s) => s.selectedId);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Prevent shortcuts when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Cmd/Ctrl + Z
      if (modKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if ((modKey && e.shiftKey && e.key === 'z') || (modKey && e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }

      // Delete selected: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeNode(selectedId);
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (modKey && e.key === 'd' && selectedId) {
        e.preventDefault();
        duplicateNode(selectedId);
        return;
      }

      // Deselect: Escape
      if (e.key === 'Escape' && selectedId) {
        e.preventDefault();
        setSelectedId(null);
        return;
      }
    },
    [selectedId, removeNode, duplicateNode, setSelectedId, undo, redo, canUndo, canRedo]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
