/**
 * CodeLanguageTabs Component
 * Tab switcher between MJML and Markdown code languages
 */

import { Code2, FileText } from "lucide-react";
import { useUIStore } from "@/features/editor/stores";
import type { CodeLanguage } from "@/features/editor/types";
import { cn } from "@/lib/utils";

export function CodeLanguageTabs() {
  const codeLanguage = useUIStore((s) => s.codeLanguage);
  const setCodeLanguage = useUIStore((s) => s.setCodeLanguage);

  const tabs: { id: CodeLanguage; label: string; icon: typeof Code2; hint: string }[] = [
    { id: "mjml", label: "MJML", icon: Code2, hint: "synced with visual editor" },
    { id: "markdown", label: "Markdown", icon: FileText, hint: "one-way convert" },
  ];

  return (
    <div className="flex items-center bg-[#1e1e1e] border-b border-[#3c3c3c] px-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = codeLanguage === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setCodeLanguage(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
              isActive
                ? "text-white border-blue-500 bg-[#252526]"
                : "text-gray-500 border-transparent hover:text-gray-300 hover:bg-[#252526]/50"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            {isActive && <span className="text-[10px] text-gray-500 ml-1">({tab.hint})</span>}
          </button>
        );
      })}
    </div>
  );
}
