/**
 * useCodeSync Hook
 * Manages code editing state and synchronization with the document store
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useEditorStore } from "@/features/editor/stores";
import { generateMjml, parseMjmlToNode, compileMjml } from "@/features/editor/lib/mjml";
import type { MjmlCompileError } from "@/features/editor/lib/mjml";

interface UseCodeSyncResult {
  /** Current code value (edited or generated) */
  code: string;
  /** Whether user has made edits */
  isDirty: boolean;
  /** Parse error message if any */
  error: string | null;
  /** Structured compilation errors with line numbers */
  compileErrors: MjmlCompileError[];
  /** Handle code changes from editor */
  handleChange: (value: string | undefined) => void;
  /** Sync edited code to document store */
  handleSync: () => void;
  /** Reset to generated code */
  handleReset: () => void;
}

/**
 * Hook for managing code synchronization between editor and document store
 * - Generates MJML from document
 * - Tracks edited state
 * - Auto-syncs with debounce for live preview
 * - Provides manual sync/reset actions
 */
export function useCodeSync(): UseCodeSyncResult {
  const document = useEditorStore((s) => s.document);
  const headSettings = useEditorStore((s) => s.headSettings);
  const setDocument = useEditorStore((s) => s.setDocument);

  const [editedCode, setEditedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [compileErrors, setCompileErrors] = useState<MjmlCompileError[]>([]);

  // Generate MJML from document using useMemo (derived state)
  const generatedMjml = useMemo(
    () => generateMjml(document, headSettings),
    [document, headSettings]
  );

  // Use edited code if user has made changes, otherwise use generated
  const code = editedCode ?? generatedMjml;
  const isDirty = editedCode !== null;

  // Auto-sync with debounce for live preview
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      try {
        const node = parseMjmlToNode(code);
        if (node) {
          setDocument(node);
          setError(null);
          // Keep isDirty true to show the modified indicator
        }
      } catch (err) {
        setError((err as Error).message);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [code, isDirty, setDocument]);

  // Run MJML compilation to detect compilation errors with line numbers
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const { compileErrors: errors } = compileMjml(code);
        setCompileErrors(errors);
      } catch {
        setCompileErrors([]);
      }
    }, 600); // Slightly longer debounce than auto-sync

    return () => clearTimeout(timer);
  }, [code]);

  const handleChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setEditedCode(value);
      setError(null);
      setCompileErrors([]);
    }
  }, []);

  const handleSync = useCallback(() => {
    try {
      const node = parseMjmlToNode(code);
      if (node) {
        setDocument(node);
        setEditedCode(null);
        setError(null);
      } else {
        setError("Failed to parse MJML. Please check the syntax.");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [code, setDocument]);

  const handleReset = useCallback(() => {
    setEditedCode(null);
    setError(null);
    setCompileErrors([]);
  }, []);

  return {
    code,
    isDirty,
    error,
    compileErrors,
    handleChange,
    handleSync,
    handleReset,
  };
}
