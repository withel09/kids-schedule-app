"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface WeekCalendarProps {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
}

export function WeekCalendar({ selectedDate, onSelectDate }: WeekCalendarProps) {
    // Generate current week view (centered or starting from today?)
    // Photo shows M T W T F S S with dates.
    const startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    return (
        <div className="w-full overflow-x-auto no-scrollbar py-4 px-1">
            <div className="flex justify-between items-center gap-2 min-w-full">
                {weekDays.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toString()}
                            onClick={() => onSelectDate(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[48px] h-[80px] rounded-[24px] transition-all",
                                isSelected
                                    ? "bg-[#96B23C] text-white shadow-lg shadow-[#96B23C]/30 scale-105" // Green Primary
                                    : "bg-white text-gray-400 border border-transparent"
                            )}
                        >
                            <span className={cn("text-xs font-medium mb-1", isSelected ? "text-white/80" : "text-gray-400")}>
                                {format(date, "EEEEE")} {/* M, T, W ... */}
                            </span>
                            <span className={cn("text-lg font-bold", isSelected ? "text-white" : "text-gray-900")}>
                                {format(date, "d")}
                            </span>
                            {/* Dot indicator for hasEvent? */}
                            {isToday && !isSelected && (
                                <div className="w-1 h-1 bg-[#96B23C] rounded-full mt-1" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
