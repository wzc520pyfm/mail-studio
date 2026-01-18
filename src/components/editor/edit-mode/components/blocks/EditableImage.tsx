"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { Image } from "lucide-react";

interface EditableImageProps {
  node: EditorNode;
}

export function EditableImage({ node }: EditableImageProps) {
  const { updateNodeProps } = useEditorStore();
  const [isEditing, setIsEditing] = useState(false);

  const src = node.props["src"] as string;
  const alt = (node.props["alt"] as string) || "";
  const align = (node.props["align"] as string) || "center";

  return (
    <div className="py-2" style={{ textAlign: align as "left" | "center" | "right" }}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg cursor-pointer hover:ring-2 hover:ring-blue-200"
          style={{ display: "inline-block" }}
          onClick={() => setIsEditing(true)}
        />
      ) : (
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
      )}
    </div>
  );
}
