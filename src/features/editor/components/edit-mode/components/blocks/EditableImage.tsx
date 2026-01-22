"use client";

import { useState } from "react";
import { useEditorStore } from "@/features/editor/stores";
import type { EditorNode } from "@/features/editor/types";
import { Image } from "lucide-react";

interface EditableImageProps {
  node: EditorNode;
  isLocked?: boolean;
}

export function EditableImage({ node, isLocked = false }: EditableImageProps) {
  const { updateNodeProps } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);

  const src = node.props["src"] as string;
  const alt = (node.props["alt"] as string) || "";
  const align = (node.props["align"] as string) || "center";
  const containerBgColor = node.props["container-background-color"] as string;

  return (
    <div
      className="py-2"
      style={{
        textAlign: align as "left" | "center" | "right",
        backgroundColor: containerBgColor,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-200"
          style={{ display: "inline-block" }}
          onClick={() => setIsEditing(true)}
        />
      ) : !isLocked ? (
        <button
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) updateNodeProps(node.id, { src: url });
          }}
          className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
        >
          <Image className="w-8 h-8 mx-auto mb-2" />
          Click to add image
        </button>
      ) : (
        <div className="w-full py-8 border-2 border-dashed border-amber-300 rounded-lg text-amber-500 text-center">
          <Image className="w-8 h-8 mx-auto mb-2" />
          Image placeholder (locked)
        </div>
      )}
    </div>
  );
}
