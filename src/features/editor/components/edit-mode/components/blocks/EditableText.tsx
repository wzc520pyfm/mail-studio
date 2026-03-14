"use client";

import type { EditorNode } from "@/features/editor/types";
import { TipTapText } from "../../../tiptap/TipTapText";

interface EditableTextProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableText({ node, isLocked = false }: EditableTextProps) {
  return <TipTapText node={node} isLocked={isLocked} />;
}
