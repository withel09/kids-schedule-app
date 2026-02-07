"use client";

import { CheckCircle2, Clock, MapPin, AlignLeft, Bell, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Schedule } from "@/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface TimelineViewProps {
    schedules: Schedule[];
    loading: boolean;
    onToggle: (id: string, isCompleted: boolean) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; label: string; textColor: string }> = {
    academy: { bg: "bg-purple-100", border: "border-purple-200", text: "text-purple-900", label: "학원", textColor: "text-purple-600" },
    school: { bg: "bg-orange-100", border: "border-orange-200", text: "text-orange-900", label: "학교", textColor: "text-orange-600" },
    homework: { bg: "bg-blue-100", border: "border-blue-200", text: "text-blue-900", label: "숙제", textColor: "text-blue-600" },
    health: { bg: "bg-green-100", border: "border-green-200", text: "text-green-900", label: "건강", textColor: "text-green-600" },
    pickup: { bg: "bg-yellow-100", border: "border-yellow-200", text: "text-yellow-900", label: "픽업", textColor: "text-yellow-600" },
    etc: { bg: "bg-stone-100", border: "border-stone-200", text: "text-stone-900", label: "기타", textColor: "text-stone-500" },
};

export function TimelineView({ schedules, loading, onToggle }: TimelineViewProps) {
    if (loading) {
        return <div className="p-10 text-center text-stone-300">로딩중...</div>;
    }

    return (
        <div className="relative px-6 pb-20">
            {/* Minimal Layout - No vertical line for clearer look */}

            {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 mt-4 text-center">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                        <Clock className="w-8 h-8 text-stone-200" />
                    </div>
                    <p className="text-stone-400 font-medium">오늘 예정된 일정이 없어요<br />새로운 일정을 추가해보세요!</p>
                </div>
            ) : (
                <div className="space-y-1 mt-2">
                    {schedules.map((schedule) => {
                        const style = CATEGORY_STYLES[schedule.category || "etc"];
                        const isDone = schedule.is_completed;

                        return (
                            <div key={schedule.id} className="flex items-start gap-3 py-3 group">
                                {/* Time Column - Minimal */}
                                <div className="w-14 text-right pt-1.5 flex flex-col items-end shrink-0">
                                    <span className={cn(
                                        "font-bold text-sm tracking-tight transition-colors font-mono",
                                        isDone ? "text-stone-300" : "text-stone-500"
                                    )}>
                                        {schedule.start_time.slice(11, 16)}
                                    </span>
                                </div>

                                {/* Interaction Area */}
                                <div className="flex-1 flex items-start gap-3 min-w-0">
                                    {/* Todo Mate Style 'Block Checkbox' */}
                                    <button
                                        onClick={() => onToggle(schedule.id, !schedule.is_completed)}
                                        className={cn(
                                            "relative w-7 h-7 rounded-lg mt-0.5 flex items-center justify-center transition-all duration-300 shrink-0",
                                            isDone
                                                ? cn(style.bg, "scale-90") // Completed: Color bg
                                                : cn("bg-stone-50 border-2", style.border, "hover:scale-105 active:scale-90") // Active: Border only
                                        )}
                                    >
                                        {isDone && (
                                            <CheckCircle2 className={cn("w-5 h-5 animate-[check-pop_0.3s_ease-out]", style.textColor)} />
                                        )}
                                    </button>

                                    {/* Content - Simple Row */}
                                    <div className={cn(
                                        "flex-1 transition-all duration-300",
                                        isDone ? "opacity-30 grayscale" : ""
                                    )}>
                                        <div className="flex items-center gap-2">
                                            <h3 className={cn(
                                                "font-bold text-base leading-snug text-stone-800",
                                                isDone && "line-through decoration-stone-300"
                                            )}>
                                                {schedule.title}
                                            </h3>
                                            {schedule.is_alarm && !isDone && (
                                                <Bell className="w-3 h-3 text-red-400 animate-pulse" />
                                            )}
                                        </div>

                                        {/* Meta row */}
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            {/* Category Tag */}
                                            <span className={cn("text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm bg-opacity-30", style.bg, style.textColor)}>
                                                {style.label}
                                            </span>

                                            {schedule.location && (
                                                <span className="flex items-center gap-0.5 text-[10px] text-stone-400">
                                                    <MapPin className="w-3 h-3" /> {schedule.location}
                                                </span>
                                            )}
                                            {schedule.memo && (
                                                <span className="text-[10px] text-stone-400 border-l border-stone-200 pl-1.5 line-clamp-1">
                                                    {schedule.memo}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
