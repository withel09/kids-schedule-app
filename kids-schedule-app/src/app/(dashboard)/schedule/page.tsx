"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Child, Schedule } from "@/types";
import { BottomNav } from "@/components/bottom-nav";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddScheduleModal } from "@/components/add-schedule-modal";

export default function SchedulePage() {
    const [children, setChildren] = useState<Child[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get Children
            const { data: kids } = await supabase.from("children").select("*").eq("user_id", user.id);
            if (kids) setChildren(kids);

            // Get Schedules
            const { data: scheds } = await supabase
                .from("schedules")
                .select("*, children(name, color, avatar_url)")
                .order("start_time", { ascending: true });
            if (scheds) setSchedules(scheds);
        };
        fetchData();

        const channel = supabase.channel('schedule_page_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchData)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    // Generate Weekly Calendar
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Filter schedules for selected date
    const dailySchedules = schedules.filter(s => isSameDay(new Date(s.start_time), selectedDate));

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
            <header className="pt-14 px-6 mb-6 bg-white pb-6 rounded-b-[2rem] shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black text-stone-900">전체 일정 🗓️</h1>
                    <div className="flex -space-x-3 overflow-hidden">
                        {children.map((child, i) => (
                            <div key={child.id} className={cn("w-10 h-10 rounded-full border-2 border-white bg-stone-200 z-" + (10 - i))}>
                                <img src={child.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.id}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <button className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 font-bold border-2 border-white text-xs z-0">
                            +{children.length > 3 ? children.length - 3 : ""}
                        </button>
                    </div>
                </div>

                {/* Week Strip */}
                <div className="flex justify-between items-center bg-stone-50 p-2 rounded-2xl">
                    {weekDays.map((day) => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-10 h-14 rounded-xl transition-all",
                                    isSelected ? "bg-stone-900 text-white shadow-md scale-105" : "text-stone-400 hover:bg-white"
                                )}
                            >
                                <span className="text-[10px] font-bold">{format(day, "EEE", { locale: ko })}</span>
                                <span className={cn("text-lg font-black", isSelected ? "text-white" : "text-stone-600")}>
                                    {format(day, "d")}
                                </span>
                                {isToday && <div className="w-1 h-1 rounded-full bg-orange-500 mt-1" />}
                            </button>
                        )
                    })}
                </div>
            </header>

            <main className="px-6 space-y-4">
                {/* Timeline List */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black text-stone-800">
                        {format(selectedDate, "M월 d일 EEEE", { locale: ko })}
                    </h2>
                    <span className="text-xs font-bold text-stone-400">{dailySchedules.length}개의 일정</span>
                </div>

                <div className="space-y-3 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-stone-100" />

                    {dailySchedules.length > 0 ? dailySchedules.map((schedule) => (
                        <div key={schedule.id} className="relative flex gap-4 group">
                            {/* Time Column */}
                            <div className="w-10 flex flex-col items-center pt-1 z-10">
                                <div className={cn("w-3 h-3 rounded-full border-2 border-white ring-4 ring-[#F8F9FA]", schedule.is_completed ? "bg-stone-300" : "bg-orange-400")} />
                                <span className="text-[10px] font-bold text-stone-400 mt-1">
                                    {format(new Date(schedule.start_time), "HH:mm")}
                                </span>
                            </div>

                            {/* Card */}
                            <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-stone-50 group-hover:shadow-md transition-all flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                                            {/* @ts-ignore - joined data */}
                                            {schedule.children?.name || "아이"}
                                        </span>
                                        <span className="text-xs font-bold text-orange-400">
                                            {schedule.category === 'vitamin' ? "💊 영양제" :
                                                schedule.category === 'school' ? "🏫 등교" :
                                                    schedule.title}
                                        </span>
                                    </div>
                                    <h3 className={cn("font-bold text-stone-800", schedule.is_completed && "line-through text-stone-300")}>
                                        {schedule.title}
                                    </h3>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={schedule.is_completed}
                                    className="w-6 h-6 rounded-full border-2 border-stone-200 text-stone-900 focus:ring-0 checked:bg-stone-900 checked:border-stone-900 transition-all cursor-pointer"
                                    onChange={async () => {
                                        await supabase.from("schedules").update({ is_completed: !schedule.is_completed }).eq("id", schedule.id);
                                    }}
                                />
                            </div>
                        </div>
                    )) : (
                        <div className="py-10 text-center">
                            <p className="text-stone-300 font-bold">등록된 일정이 없어요 😴</p>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-24 right-5 z-50">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-14 h-14 rounded-full bg-stone-900 shadow-xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <BottomNav activeTab="schedule" onTabChange={() => { }} />

            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                childrenList={children}
                defaultChildId={children[0]?.id || ""}
            />
        </div>
    );
}
