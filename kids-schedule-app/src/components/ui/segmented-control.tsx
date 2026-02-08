"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps {
    options: string[];
    selected: string;
    onSelect: (option: string) => void;
}

export function SegmentedControl({ options, selected, onSelect }: SegmentedControlProps) {
    return (
        <div className="flex bg-gray-100 p-1 rounded-[20px] mb-6">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onSelect(option)}
                    className={cn(
                        "flex-1 py-3 text-sm font-bold rounded-[16px] transition-all duration-300",
                        selected === option
                            ? "bg-[#2D3648] text-white shadow-md"
                            : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
