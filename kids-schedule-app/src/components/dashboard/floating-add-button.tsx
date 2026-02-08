"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingAddButtonProps {
    onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "fixed bottom-24 right-6 w-14 h-14 rounded-full shadow-lg shadow-[#96B23C]/40",
                "bg-[#96B23C] text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95",
                "z-40"
            )}
        >
            <Plus className="w-8 h-8" strokeWidth={2.5} />
        </button>
    );
}
