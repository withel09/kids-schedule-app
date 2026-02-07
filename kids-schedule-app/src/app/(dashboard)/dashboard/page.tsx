"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Child, Schedule } from "@/types";
import { AddScheduleModal } from "@/components/add-schedule-modal";
import { ChildSetupModal } from "@/components/child-setup-modal";
import { BottomNav } from "@/components/bottom-nav";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
    Star, Sun, Moon, BookOpen, Music, Gamepad2, PlayCircle, CheckCircle2, Plus, Smile
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

const ROUTINE_CATEGORIES = [
    { id: "morning", label: "아침 루틴", icon: Sun, color: "bg-orange-100 text-orange-500" },
    { id: "school", label: "학교 생활", icon: BookOpen, color: "bg-blue-100 text-blue-500" },
    { id: "play", label: "놀이 시간", icon: Gamepad2, color: "bg-green-100 text-green-500" },
    { id: "bed", label: "잠자리", icon: Moon, color: "bg-indigo-100 text-indigo-500" },
];

const RECOMMENDED_STORIES = [
    { id: 1, title: "양치질 대장 토끼", duration: "5분", color: "bg-[#FFEFD5]", image: "🐰" },
    { id: 2, title: "용감한 사자", duration: "10분", color: "bg-[#E6F3FF]", image: "🦁" },
    { id: 3, title: "달님과 자장가", duration: "15분", color: "bg-[#F0F0FF]", image: "🌙" },
];

export default function Dashboard() {
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedKidId, setSelectedKidId] = useState<string | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isChildSetupOpen, setIsChildSetupOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("morning");
    const [speechText, setSpeechText] = useState("엄마, 오늘 간식은 뭐예요? 🍩");

    // Fetch Children
    useEffect(() => {
        const fetchChildren = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from("children").select("*").eq("user_id", user.id);
            if (data && data.length > 0) {
                setChildren(data);
                if (!selectedKidId) setSelectedKidId(data[0].id);
            } else {
                setIsChildSetupOpen(true);
            }
            setLoading(false);
        };
        fetchChildren();
    }, []);

    // Random Speech
    useEffect(() => {
        const messages = [
            "엄마, 오늘 간식은 뭐예요? 🍩",
            "숙제 다 하면 놀아주세요! 🎮",
            "학교 다녀오겠습니다! 🏫",
            "사랑해요 엄마! ❤️",
            "오늘 친구랑 놀고 싶어요! ⚽️"
        ];
        // Change message every 10 seconds or on kid switch
        setSpeechText(messages[Math.floor(Math.random() * messages.length)]);
    }, [selectedKidId]);

    // Fetch Schedules
    useEffect(() => {
        if (!selectedKidId) return;
        const fetchSchedules = async () => {
            setLoading(true);
            const { data } = await supabase
                .from("schedules")
                .select("*")
                .eq("child_id", selectedKidId)
                .order("start_time", { ascending: true });
            setSchedules(data || []);
            setLoading(false);
        };
        fetchSchedules();

        const channel = supabase.channel('dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, fetchSchedules)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [selectedKidId]);

    const selectedKid = children.find(c => c.id === selectedKidId);

    // Grouping
    const morningRoutines = schedules.filter(s => { const h = new Date(s.start_time).getHours(); return h >= 6 && h < 12; });
    const afternoonRoutines = schedules.filter(s => { const h = new Date(s.start_time).getHours(); return h >= 12 && h < 18; });
    const eveningRoutines = schedules.filter(s => { const h = new Date(s.start_time).getHours(); return h >= 18 || h < 6; });
    const currentRoutines = activeTab === 'morning' ? morningRoutines
        : activeTab === 'school' ? afternoonRoutines
            : activeTab === 'play' ? afternoonRoutines
                : eveningRoutines;

    const handleComplete = async (schedule: Schedule) => {
        // Optimistic update
        const newStatus = !schedule.is_completed;
        setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, is_completed: newStatus } : s));

        if (newStatus) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
        await supabase.from("schedules").update({ is_completed: newStatus }).eq("id", schedule.id);
    };

    return (
        <div className="min-h-screen bg-[#FFFBF7] pb-24 relative font-sans overflow-x-hidden">
            {/* Header */}
            <header className="pt-14 px-6 mb-4">
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        <p className="text-stone-400 font-bold mb-1 ml-1 text-sm">Welcome Back</p>
                        <h1 className="text-3xl font-black text-stone-800 tracking-tight flex items-center gap-2">
                            {selectedKid ? selectedKid.name : "우리 아이"} <span className="text-orange-400 text-3xl">👋</span>
                        </h1>
                        {/* Speech Bubble */}
                        <div className="absolute -bottom-8 left-0 bg-white border border-stone-100 shadow-sm rounded-tr-xl rounded-bl-xl rounded-br-xl py-1 px-3 animate-in fade-in slide-in-from-left-2 duration-500">
                            <span className="text-xs font-bold text-stone-600">"{speechText}"</span>
                        </div>
                    </div>

                    {/* Simple Child Switcher Row */}
                    <div className="flex bg-white p-1 rounded-full shadow-sm border border-stone-50">
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => setSelectedKidId(child.id)}
                                className={cn(
                                    "w-10 h-10 rounded-full overflow-hidden transition-all relative border-2",
                                    selectedKidId === child.id ? "scale-110 border-orange-400 z-10" : "scale-90 border-transparent opacity-50 grayscale hover:grayscale-0"
                                )}
                            >
                                <img src={child.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${child.id}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                        <button onClick={() => setIsChildSetupOpen(true)} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-300 hover:bg-stone-200">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="h-4" />

                {/* Routine Categories */}
                <div className="flex justify-between px-2 gap-2 mt-8">
                    {ROUTINE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveTab(cat.id)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group-active:scale-90",
                                activeTab === cat.id ? cn(cat.color, "ring-4 ring-white shadow-lg scale-110") : "bg-white text-stone-300"
                            )}>
                                <cat.icon className="w-7 h-7" />
                            </div>
                            <span className={cn("text-xs font-bold transition-colors", activeTab === cat.id ? "text-stone-800" : "text-stone-400")}>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <main className="px-6 space-y-8">
                {/* Routine Cards */}
                <div>
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-xl font-extrabold text-stone-800">
                            {activeTab === 'morning' ? "아침 미션 ☀️" : activeTab === 'bed' ? "꿈나라 여행 🌙" : "오후 활동 ⚡️"}
                        </h2>
                    </div>

                    {currentRoutines.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x snap-mandatory">
                            {currentRoutines.map((routine, idx) => (
                                <div key={routine.id} className="snap-center shrink-0 w-[85%] relative">
                                    <div className={cn(
                                        "h-52 rounded-[2.5rem] p-7 flex flex-col justify-between shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] transition-transform border-[3px] border-white",
                                        idx % 2 === 0 ? "bg-[#FFEFD5]" : "bg-[#E6F3FF]"
                                    )}>
                                        <div className="flex justify-between items-start">
                                            <span className="bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-stone-700 shadow-sm">
                                                {format(new Date(routine.start_time), "HH:mm")}
                                            </span>
                                            <button
                                                onClick={() => handleComplete(routine)}
                                                className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all",
                                                    routine.is_completed ? "bg-green-400 text-white" : "bg-white text-stone-300"
                                                )}
                                            >
                                                <CheckCircle2 className="w-6 h-6" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-stone-800 leading-tight mb-2 tracking-tight">{routine.title}</h3>
                                            <p className="text-stone-500 font-bold text-sm">
                                                {routine.is_completed ? "참 잘했어요! 🌟" : "지금 바로 시작해볼까요?"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-20 h-20 text-[4rem] drop-shadow-xl animate-bounce duration-1000 origin-bottom">
                                        {routine.category === 'vitamin' ? '💊' :
                                            routine.category === 'school' ? '🎒' : '🧸'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-8 text-center border-2 border-dashed border-stone-100">
                            <Smile className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                            <p className="text-stone-400 font-bold mb-4">아직 미션이 없어요!</p>
                            <Button onClick={() => setIsAddModalOpen(true)} className="rounded-full bg-stone-900 text-white font-bold px-6">
                                + 미션 추가하기
                            </Button>
                        </div>
                    )}
                </div>

                {/* Recommended */}
                <div>
                    <h2 className="text-lg font-extrabold text-stone-800 mb-4 px-1">추천 활동</h2>
                    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-stone-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl">
                                🎨
                            </div>
                            <div>
                                <h3 className="font-black text-stone-800">그림 그리기</h3>
                                <p className="text-stone-400 text-xs font-bold">집중력 향상에 좋아요</p>
                            </div>
                        </div>
                        <PlayCircle className="w-8 h-8 text-stone-200" />
                    </div>
                </div>

                <div className="h-12" />
            </main>

            <div className="fixed bottom-24 right-5 z-40">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-16 h-16 rounded-full bg-stone-900 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform"
                >
                    <Plus className="w-7 h-7" />
                </button>
            </div>

            <BottomNav activeTab="home" onTabChange={() => { }} />
            <AddScheduleModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                childrenList={children}
                defaultChildId={selectedKidId || ""}
            />
            <ChildSetupModal isOpen={isChildSetupOpen} onSuccess={() => setIsChildSetupOpen(false)} />
        </div>
    );
}
