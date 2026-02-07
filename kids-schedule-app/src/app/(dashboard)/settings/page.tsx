"use client";

import { BottomNav } from "@/components/bottom-nav";
import { User, Bell, LogOut, ChevronRight, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
            <header className="pt-14 px-6 mb-8">
                <h1 className="text-3xl font-black text-stone-900">설정 ⚙️</h1>
            </header>

            <main className="px-6 space-y-6">
                {/* Account Section */}
                <section>
                    <h2 className="text-xs font-bold text-stone-400 mb-3 px-1">계정 관리</h2>
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-50">
                        <button className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors border-b border-stone-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                                    <User className="w-5 h-5 text-stone-500" />
                                </div>
                                <span className="font-bold text-stone-700">부모님 프로필 수정</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-stone-300" />
                        </button>
                        <button className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-stone-500" />
                                </div>
                                <span className="font-bold text-stone-700">아이 관리 (자녀 추가)</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-stone-300" />
                        </button>
                    </div>
                </section>

                {/* App Settings */}
                <section>
                    <h2 className="text-xs font-bold text-stone-400 mb-3 px-1">앱 설정</h2>
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-stone-50">
                        <button className="w-full flex items-center justify-between p-5 hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-stone-500" />
                                </div>
                                <span className="font-bold text-stone-700">알림 설정</span>
                            </div>
                            <div className="bg-stone-900 text-white text-[10px] font-bold px-2 py-1 rounded-full">ON</div>
                        </button>
                    </div>
                </section>

                <button
                    onClick={handleLogout}
                    className="w-full bg-white rounded-[2rem] p-5 flex items-center justify-center gap-2 text-red-500 font-bold shadow-sm border border-stone-50 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    로그아웃
                </button>

                <p className="text-center text-[10px] text-stone-300 pt-4">
                    Kids Schedule Manager v1.0.0
                </p>
            </main>

            <BottomNav activeTab="settings" onTabChange={() => { }} />
        </div>
    );
}
