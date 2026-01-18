"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddSectionButtonProps {
  onAddSection: (columns: number) => void;
}

const layouts = [
  { columns: 1, label: "1 Column", icon: "█" },
  { columns: 2, label: "2 Columns", icon: "██" },
  { columns: 3, label: "3 Columns", icon: "███" },
  { columns: 4, label: "4 Columns", icon: "████" },
];

export function AddSectionButton({ onAddSection }: AddSectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full py-3 flex items-center justify-center gap-2 text-gray-400 rounded-lg transition-all border-2 border-dashed border-gray-200",
            "hover:bg-gray-50 hover:text-gray-600 hover:border-gray-300",
            isOpen && "bg-gray-50 border-gray-300"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Section</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="center">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 px-2 mb-2">Choose Layout</p>
          {layouts.map(({ columns, label, icon }) => (
            <button
              key={columns}
              onClick={() => {
                onAddSection(columns);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-xs font-mono text-gray-400 w-12">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
