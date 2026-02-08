"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Schedule } from "@/types";

interface RoutineCardProps {
    schedule: Schedule;
    onToggle: (id: string, isCompleted: boolean) => void;
}

export function RoutineCard({ schedule, onToggle }: RoutineCardProps) {
    const isCompleted = schedule.is_completed;

    // Dynamic Pastel Colors based on Category or Title
    // e.g. Study -> Purple, Play -> Blue, etc.
    // Or random deterministic?
    // Let's map categories to specific Tailwind classes for "Habitly" look.
    const getTheme = (cat: string) => {
        switch (cat) {
            case 'study': return "bg-[#E8F1FF] text-[#4B7BE5]"; // Soft Blue
            case 'play': return "bg-[#FFF4E5] text-[#FF9F43]"; // Soft Orange
            case 'meals': return "bg-[#E6FFFA] text-[#00B894]"; // Soft Green
            case 'sleep': return "bg-[#F3E5F5] text-[#9C27B0]"; // Soft Purple
            default: return "bg-[#FFF0F0] text-[#FF6B6B]"; // Soft Red/Pink
        }
    };

    const theme = getTheme(schedule.category);

    return (
        <div className={cn(
            "rounded-[32px] p-5 mb-4 flex items-center justify-between transition-all",
            theme.split(' ')[0] // Background color
        )}>
            {/* Left: Icon & Info */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
                    {/* Icon mapped from category or title */}
                    {schedule.title.includes("학교") ? "🏫" :
                        schedule.title.includes("피아노") ? "🎹" :
                            schedule.title.includes("책") ? "📖" :
                                schedule.category === 'study' ? '✏️' : '🌟'}
                </div>

                <div className="flex flex-col">
                    <h3 className="font-bold text-gray-800 text-lg mb-0.5">{schedule.title}</h3>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 w-fit", theme.split(' ')[1])}>
                        {schedule.category.toUpperCase()} • {schedule.start_time.substring(11, 16)}
                    </span>
                </div>
            </div>

            {/* Right: Check Button (Big White Circle) */}
            <button
                onClick={() => onToggle(schedule.id, !isCompleted)}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-all active:scale-95",
                    isCompleted ? "bg-[#2D3648] text-white" : "bg-white text-gray-200"
                )}
            >
                <Check className={cn("w-8 h-8", isCompleted ? "stroke-[4px]" : "stroke-[4px]")} />
            </button>
        </div>
    );
}
