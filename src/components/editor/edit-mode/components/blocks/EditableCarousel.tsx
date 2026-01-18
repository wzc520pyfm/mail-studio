"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor";
import { EditorNode } from "@/types/editor";
import { generateId } from "@/lib/mjml/schema";
import { cn } from "@/lib/utils";
import { GalleryHorizontal, ChevronRight, Plus, Trash2 } from "lucide-react";

interface EditableCarouselProps {
  node: EditorNode;
}

export function EditableCarousel({ node }: EditableCarouselProps) {
  const { addChildNode, removeNode, selectedId, setSelectedId } = useEditorStore();
  const isSelected = selectedId === node.id;
  const children = node.children || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleAddSlide = () => {
    const newSlide: EditorNode = {
      id: generateId(),
      type: "mj-carousel-image",
      props: {
        src: "https://placehold.co/600x300/e2e8f0/64748b?text=New+Slide",
        alt: "New slide",
      },
    };
    addChildNode(node.id, newSlide);
  };

  return (
    <div className="py-2">
      <div
        className={cn(
          "border rounded-lg overflow-hidden transition-all",
          isSelected ? "ring-2 ring-blue-200" : "hover:border-gray-300"
        )}
        onClick={() => setSelectedId(node.id)}
      >
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GalleryHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Carousel</span>
          </div>
          <span className="text-xs text-gray-400">{children.length} slides</span>
        </div>

        {children.length > 0 ? (
          <div className="relative">
            <div className="aspect-[2/1] bg-gray-100">
              {children[activeIndex] && (
                <img
                  src={children[activeIndex].props.src as string}
                  alt={(children[activeIndex].props.alt as string) || ""}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {children.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === activeIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>

            {children.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i > 0 ? i - 1 : children.length - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((i) => (i < children.length - 1 ? i + 1 : 0));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No slides yet</div>
        )}

        <div className="px-3 py-2 border-t bg-gray-50">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {children.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "relative flex-shrink-0 w-16 h-10 rounded border cursor-pointer overflow-hidden",
                  index === activeIndex ? "ring-2 ring-blue-400" : ""
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(index);
                }}
              >
                <img
                  src={slide.props.src as string}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNode(slide.id);
                    if (activeIndex >= children.length - 1) {
                      setActiveIndex(Math.max(0, children.length - 2));
                    }
                  }}
                  className="absolute top-0 right-0 p-0.5 bg-red-500 text-white opacity-0 hover:opacity-100"
                >
                  <Trash2 className="w-2 h-2" />
                </button>
              </div>
            ))}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddSlide();
              }}
              className="flex-shrink-0 w-16 h-10 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-500"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
