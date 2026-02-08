"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Added DialogTitle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { format, addHours, differenceInMinutes } from "date-fns";
import {
    Briefcase, GraduationCap, Gamepad2, HeartPulse, Bus, Star,
    MapPin, AlignLeft, Calendar as CalendarIcon, Bell, Check, Pill, Music, Book
} from "lucide-react";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sound";

interface Child {
    id: string;
    name: string;
    avatar_url?: string;
}

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    childrenList: Child[];
    defaultChildId: string;
}

// Preset Routine Items (Moms want these!)
const ROUTINE_PRESETS = [
    { id: "vitamin", label: "영양제", icon: Pill, color: "bg-red-100 text-red-500" },
    { id: "school", label: "등교", icon: GraduationCap, color: "bg-orange-100 text-orange-500" },
    { id: "pickup", label: "픽업", icon: Bus, color: "bg-yellow-100 text-yellow-600" },
    { id: "academy", label: "학원", icon: Briefcase, color: "bg-green-100 text-green-500" },
    { id: "homework", label: "숙제", icon: Star, color: "bg-teal-100 text-teal-500" },
    { id: "play", label: "놀이", icon: Gamepad2, color: "bg-blue-100 text-blue-500" },
    { id: "piano", label: "피아노", icon: Music, color: "bg-indigo-100 text-indigo-500" },
    { id: "reading", label: "독서", icon: Book, color: "bg-purple-100 text-purple-500" },
];

const SIMPLE_TIMES = [
    "07:00", "08:00", "09:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

export function AddScheduleModal({ isOpen, onClose, onSuccess, childrenList, defaultChildId }: AddScheduleModalProps) {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("10:00");
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1); // 1: Select Type, 2: Details

    const handlePresetClick = (preset: typeof ROUTINE_PRESETS[0]) => {
        setTitle(preset.label);
        setSelectedPreset(preset.id);
        setStep(2); // Go to detail view
    };

    const handleSave = async () => {
        if (!title) return;

        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        const payload = {
            user_id: (await supabase.auth.getUser()).data.user?.id,
            child_id: defaultChildId,
            title,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            // category: derived from preset logic if needed
            category: selectedPreset || 'etc',
            is_alarm: true,
            is_completed: false
        };

        await supabase.from('schedules').insert([payload]);
        onSuccess?.();
        onClose();
        // Reset
        setStep(1);
        setTitle("");
        setSelectedPreset(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            {/* Bottom Sheet Style Content */}
            <DialogContent className="fixed bottom-0 md:bottom-auto top-auto md:top-1/2 left-0 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[400px] h-[85vh] md:h-auto rounded-t-[2.5rem] md:rounded-[2.5rem] p-0 border-0 shadow-2xl bg-[#F8F9FA] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom duration-300">
                <DialogTitle className="sr-only">새로운 일정 추가</DialogTitle>

                {/* Drag Handle */}
                <div className="w-full flex justify-center pt-3 pb-1 bg-white cursor-pointer" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-stone-200" />
                </div>

                <div className="h-full overflow-y-auto pb-10">
                    {step === 1 ? (
                        /* STEP 1: Quick Preset Grid */
                        <div className="p-6 pt-2">
                            <div className="mb-6 text-center">
                                <h2 className="text-2xl font-black text-stone-800 mb-1">어떤 루틴인가요?</h2>
                                <p className="text-stone-400 font-bold text-sm">아이의 하루를 채워보세요 ✨</p>
                            </div>

                            <div className="grid grid-cols-4 gap-3 md:gap-4">
                                {ROUTINE_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetClick(preset)}
                                        className="aspect-[4/5] flex flex-col items-center justify-center gap-2 bg-white rounded-2xl shadow-sm border border-stone-100 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", preset.color)}>
                                            <preset.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold text-stone-600">{preset.label}</span>
                                    </button>
                                ))}
                                {/* Custom input button */}
                                <button onClick={() => setStep(2)} className="col-span-4 mt-2 h-14 rounded-2xl bg-stone-100 text-stone-400 font-bold border-2 border-dashed border-stone-200 hover:bg-stone-200 hover:border-stone-300 transition-colors">
                                    + 직접 입력하기
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: Detail Editor */
                        <div className="p-6 pt-2">
                            <div className="flex items-center gap-2 mb-6">
                                <button onClick={() => setStep(1)} className="text-stone-400 font-bold text-sm hover:text-stone-600">
                                    ← 뒤로
                                </button>
                                <h2 className="text-xl font-black text-stone-800 ml-auto">세부 설정</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Title Input */}
                                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-50">
                                    <span className="text-xs font-bold text-stone-400 block mb-2 px-1">할 일</span>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-xl font-bold border-none p-0 shadow-none focus-visible:ring-0"
                                        placeholder="일정 이름"
                                    />
                                </div>

                                {/* Time Selection (Simple Chips) */}
                                <div>
                                    <span className="text-xs font-bold text-stone-400 block mb-3 px-1">시간 선택</span>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                                        {SIMPLE_TIMES.map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setStartTime(t)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border",
                                                    startTime === t
                                                        ? "bg-stone-900 text-white border-stone-900 shadow-lg scale-105"
                                                        : "bg-white text-stone-400 border-stone-100 hover:bg-stone-50"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Picker */}
                                <div className="bg-white p-4 rounded-3xl shadow-sm border border-stone-50 flex items-center justify-between">
                                    <span className="text-sm font-bold text-stone-500">날짜</span>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="font-bold text-stone-800 bg-transparent text-right outline-none"
                                    />
                                </div>

                                <Button onClick={handleSave} className="w-full h-14 rounded-2xl bg-stone-900 text-lg font-bold hover:bg-stone-800 shadow-xl mt-4">
                                    저장하기
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
