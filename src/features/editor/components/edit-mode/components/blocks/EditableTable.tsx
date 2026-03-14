"use client";

import type { EditorNode } from "@/features/editor/types";
import { TipTapTable } from "../../../tiptap/TipTapTable";

interface EditableTableProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableTable({ node, isLocked = false }: EditableTableProps) {
  return <TipTapTable node={node} isLocked={isLocked} />;
}
