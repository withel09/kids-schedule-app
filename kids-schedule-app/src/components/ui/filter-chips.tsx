"use client";

import { cn } from "@/lib/utils";

interface FilterChipsProps {
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
}

export function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
    return (
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-6 px-1">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={cn(
                        "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border",
                        selected === option
                            ? "bg-[#D4E8B0] text-[#4A644E] border-[#D4E8B0]" // Warm Green Active
                            : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
