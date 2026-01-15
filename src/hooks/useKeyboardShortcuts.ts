'use client';

import { useEffect, useCallback } from 'react';
import { useEditorStore, useTemporalStore } from '@/stores/editor';

export function useKeyboardShortcuts() {
  const { selectedId, removeNode, duplicateNode, setSelectedId } = useEditorStore();
  const { undo, redo, pastStates, futureStates } = useTemporalStore().getState();

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
        if (pastStates.length > 0) {
          undo();
        }
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if ((modKey && e.shiftKey && e.key === 'z') || (modKey && e.key === 'y')) {
        e.preventDefault();
        if (futureStates.length > 0) {
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
    [selectedId, removeNode, duplicateNode, setSelectedId, undo, redo, pastStates.length, futureStates.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
