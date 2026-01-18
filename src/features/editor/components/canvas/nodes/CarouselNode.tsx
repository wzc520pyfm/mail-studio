/**
 * Carousel node renderer for Canvas mode
 * Displays a preview of carousel slides
 */

"use client";

import { memo, useState } from "react";
import { GalleryHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorNode } from "@/features/editor/types";

interface CarouselNodeProps {
  node: EditorNode;
}

export const CarouselNode = memo(function CarouselNode({ node }: CarouselNodeProps) {
  const children = node.children || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i > 0 ? i - 1 : children.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((i) => (i < children.length - 1 ? i + 1 : 0));
  };

  const thumbnails = (node.props.thumbnails as string) || "visible";

  return (
    <div className="py-2">
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GalleryHorizontal className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-medium text-gray-500">Carousel</span>
          </div>
          <span className="text-xs text-gray-400">{children.length} slides</span>
        </div>

        {children.length > 0 ? (
          <>
            <div className="relative">
              <div className="aspect-[2/1] bg-gray-100 overflow-hidden">
                {children[activeIndex] && (
                  <img
                    src={children[activeIndex].props.src as string}
                    alt={(children[activeIndex].props.alt as string) || ""}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Dots indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {children.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(index);
                    }}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all shadow-sm",
                      index === activeIndex ? "bg-white scale-110" : "bg-white/60 hover:bg-white/80"
                    )}
                  />
                ))}
              </div>

              {/* Navigation arrows */}
              {children.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all hover:scale-105"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-md transition-all hover:scale-105"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {thumbnails !== "hidden" && children.length > 1 && (
              <div className="px-3 py-2 border-t bg-gray-50">
                <div className="flex gap-2 overflow-x-auto">
                  {children.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveIndex(index);
                      }}
                      className={cn(
                        "flex-shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all",
                        index === activeIndex
                          ? "border-blue-500 shadow-sm"
                          : "border-transparent hover:border-gray-300"
                      )}
                    >
                      <img
                        src={slide.props.src as string}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <GalleryHorizontal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <span className="text-sm">No slides yet</span>
          </div>
        )}
      </div>
    </div>
  );
});
