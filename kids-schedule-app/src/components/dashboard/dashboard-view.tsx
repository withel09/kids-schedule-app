"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FilterChips } from "@/components/ui/filter-chips";
import { WeekCalendar } from "./week-calendar";
import { RoutineCard } from "./routine-card";
import { FloatingAddButton } from "./floating-add-button";
import { ChildSetupModal } from "@/components/child-setup-modal";
import { AddScheduleModal } from "@/components/add-schedule-modal";
import { Schedule, Child } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import { BottomNav } from "@/components/layout/bottom-nav";


interface DashboardViewProps {
    initialSchedules: Schedule[];
    initialChildren?: Child[];
    userId: string;
}

export function DashboardView({ initialSchedules, initialChildren = [], userId }: DashboardViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isChildModalOpen, setIsChildModalOpen] = useState(initialChildren.length === 0); // Open if no child

    // New State for Filters
    const [viewMode, setViewMode] = useState("Today"); // Today, Weekly, Overall
    const [timeFilter, setTimeFilter] = useState("All"); // All, Morning, Afternoon, Evening

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Filter schedules for selected date
    // Note: This logic depends on whether 'start_time' is ISO string. 
    // We assume start_time stores the date.
    // Also handle recurring logic if needed later. For now, simple date match.
    // Filter Logic
    // 1. Date Filter (WeekCalendar updates selectedDate)
    // 2. Time Filter
    const getPeriod = (time: string) => {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12) return "Morning";
        if (hour < 17) return "Afternoon";
        return "Evening";
    };

    const visibleSchedules = schedules
        .filter(s => isSameDay(new Date(s.start_time), selectedDate))
        .filter(s => {
            if (timeFilter === "All") return true;
            const timePart = s.start_time.split('T')[1];
            return getPeriod(timePart) === timeFilter;
        })
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const handleToggle = async (id: string, isCompleted: boolean) => {
        // Optimistic Update
        setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_completed: isCompleted } : s));

        // DEMO MODE CHECK
        if (userId === "demo-user") {
            console.log("Demo Mode: Toggled", id, isCompleted);
            return;
        }

        // DB Update
        await supabase.from('schedules').update({ is_completed: isCompleted }).eq('id', id);
    };

    const handleAddSuccess = async () => {
        // Refresh data? Or just close modal and let realtime/refresh handle?
        // For simplicity, reload page or fetch new data.
        // Ideally we append the new schedule.
        window.location.reload();
    };

    const handleChildSave = async () => {
        setIsChildModalOpen(false);
        window.location.reload();
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA]">
            {/* Header Area */}
            <div className="pt-8 px-6 pb-2 bg-white sticky top-0 z-10 rounded-b-[32px] shadow-sm mb-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-extrabold text-[#2D3648]">Home</h1>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            🔋
                        </div>
                        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            •••
                        </button>
                    </div>
                </div>

                {/* Segmented Control (Tabs) */}
                <SegmentedControl
                    options={["Today", "Weekly", "Overall"]}
                    selected={viewMode}
                    onSelect={setViewMode}
                />

                {/* Week Calendar (Only visible if Today/Weekly) */}
                <WeekCalendar
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />
            </div>

            {/* Routine List Area */}
            <div className="flex-1 px-6">

                {/* Filter Chips */}
                <FilterChips
                    options={["All", "Morning", "Afternoon", "Evening"]}
                    selected={timeFilter}
                    onSelect={setTimeFilter}
                />

                <div className="flex justify-between items-end mb-4 px-1">
                    <h2 className="text-xl font-bold text-[#2D3648]">Habits</h2>
                    <span className="text-sm text-gray-400">See all</span>
                </div>

                {visibleSchedules.length > 0 ? (
                    <div className="pb-24">
                        {visibleSchedules.map(schedule => (
                            <RoutineCard
                                key={schedule.id}
                                schedule={schedule}
                                onToggle={handleToggle}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <p>No habits for {timeFilter === 'All' ? 'this time' : timeFilter}.</p>
                    </div>
                )}
            </div>

            <FloatingAddButton onClick={() => setIsAddModalOpen(true)} />

            {/* Modals */}
            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
                childrenList={initialChildren}
                defaultChildId={initialChildren[0]?.id || "demo-child"}
            />

            <ChildSetupModal
                isOpen={isChildModalOpen}
                onSave={handleChildSave}
            />

            <BottomNav />
        </div>
    );
}
