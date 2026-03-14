"use client";

import type { EditorNode } from "@/features/editor/types";
import { TipTapButton } from "../../../tiptap/TipTapButton";

interface EditableButtonProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableButton({ node, isLocked = false }: EditableButtonProps) {
  return <TipTapButton node={node} isLocked={isLocked} />;
}
