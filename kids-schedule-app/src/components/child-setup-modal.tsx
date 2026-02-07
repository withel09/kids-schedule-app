"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon, Check, Loader2, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Child } from "@/types";

interface ChildSetupModalProps {
    isOpen: boolean;
    onSave: (child: Child) => void;
}

const COLORS = [
    { name: "Blue", value: "bg-blue-200 text-blue-700 border-blue-300" },
    { name: "Pink", value: "bg-pink-200 text-pink-700 border-pink-300" },
    { name: "Green", value: "bg-green-200 text-green-700 border-green-300" },
    { name: "Yellow", value: "bg-yellow-200 text-yellow-700 border-yellow-300" },
    { name: "Purple", value: "bg-purple-200 text-purple-700 border-purple-300" },
    { name: "Stone", value: "bg-stone-200 text-stone-700 border-stone-300" },
];

const CHARACTERS = ["🐻", "🐰", "🐯", "🐶", "🐱", "🦄", "🦖", "🐳"];

export function ChildSetupModal({ isOpen, onSave }: ChildSetupModalProps) {
    const [name, setName] = useState("");
    const [gender, setGender] = useState<"boy" | "girl">("boy");
    const [character, setCharacter] = useState(CHARACTERS[0]);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
    const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSave = async () => {
        if (!name) return alert("이름을 입력해주세요.");
        if (!birthdate) return alert("생년월일을 선택해주세요.");

        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("로그인이 필요합니다.");

            let finalCharacterIcon = character;

            // Upload Photo if exists
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('kids-avatars')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('kids-avatars')
                    .getPublicUrl(fileName);

                finalCharacterIcon = publicUrl;
            }

            const payload = {
                user_id: user.id,
                name,
                gender,
                character_icon: finalCharacterIcon,
                birthdate: format(birthdate, "yyyy-MM-dd"), // Store as YYYY-MM-DD
                color: selectedColor,
            };

            const { data, error } = await supabase
                .from('children')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;

            onSave(data as Child);
        } catch (error: any) {
            console.error("Child save error:", error);
            if (error.message?.includes("Bucket not found")) {
                alert("저장소 설정이 필요합니다. Supabase에서 'kids-avatars' 버킷을 만들어주세요!");
            } else {
                alert("저장 실패: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl [&>button]:hidden text-center" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mt-2">환영합니다! 🎉</DialogTitle>
                    <DialogDescription className="text-center">
                        스케줄 관리를 위해 아이 정보를 입력해주세요.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4 text-left">
                    {/* Character/Photo Picker */}
                    <div className="flex justify-center mb-2">
                        <div className="relative group cursor-pointer transition-transform hover:scale-105 active:scale-95" onClick={() => document.getElementById('avatar-input')?.click()}>
                            <Avatar className="w-28 h-28 shadow-xl border-4 border-white ring-2 ring-stone-100">
                                <AvatarImage src={previewUrl || (character.startsWith('http') ? character : undefined)} className="object-cover" />
                                <AvatarFallback className="text-6xl bg-stone-100 flex items-center justify-center pt-2">
                                    {character}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 bg-stone-900 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:bg-stone-800">
                                <Camera className="w-5 h-5" />
                            </div>
                            <input
                                id="avatar-input"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-center text-stone-500 text-xs mb-1">또는 캐릭터 선택</Label>
                        <div className="flex justify-center gap-1.5 px-2 flex-wrap">
                            {CHARACTERS.map((char) => (
                                <button
                                    key={char}
                                    onClick={() => {
                                        setCharacter(char);
                                        setFile(null);
                                        setPreviewUrl(null);
                                    }}
                                    className={cn(
                                        "w-9 h-9 text-2xl rounded-full transition-all flex items-center justify-center hover:bg-stone-100 hover:scale-110",
                                        character === char && !file ? "bg-stone-200 scale-110 shadow-sm ring-2 ring-stone-900 ring-offset-1" : "opacity-70 hover:opacity-100"
                                    )}
                                >
                                    {char}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="grid gap-2">
                        <Label htmlFor="name">아이 이름</Label>
                        <Input
                            id="name"
                            placeholder="예: 김서준"
                            className="rounded-xl h-11"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Gender */}
                    <div className="grid gap-2">
                        <Label>성별</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setGender("boy")}
                                className={cn(
                                    "h-11 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all",
                                    gender === "boy"
                                        ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500"
                                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                                )}
                            >
                                👦 남자아이
                            </button>
                            <button
                                onClick={() => setGender("girl")}
                                className={cn(
                                    "h-11 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all",
                                    gender === "girl"
                                        ? "bg-pink-50 border-pink-500 text-pink-700 ring-1 ring-pink-500"
                                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                                )}
                            >
                                👧 여자아이
                            </button>
                        </div>
                    </div>

                    {/* Birthdate */}
                    <div className="grid gap-2">
                        <Label>생년월일</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal rounded-xl h-11",
                                        !birthdate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {birthdate ? format(birthdate, "yyyy년 MM월 dd일", { locale: ko }) : <span>생년월일 선택</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={birthdate}
                                    onSelect={setBirthdate}
                                    initialFocus
                                    fromYear={2000}
                                    toYear={new Date().getFullYear()}
                                    captionLayout="dropdown"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Color Picker */}
                    <div className="grid gap-2">
                        <Label>대표 색상</Label>
                        <div className="flex justify-between gap-2 p-1">
                            {COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setSelectedColor(c.value)}
                                    className={cn(
                                        "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center relative",
                                        c.value.split(" ")[0], // bg color
                                        selectedColor === c.value ? "border-stone-900 scale-110 shadow-sm" : "border-transparent"
                                    )}
                                    title={c.name}
                                >
                                    {selectedColor === c.value && <Check className="w-4 h-4 text-stone-900/50" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter className="mt-2">
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full rounded-xl h-12 text-lg font-bold bg-stone-900 hover:bg-stone-800"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "등록하고 시작하기"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
