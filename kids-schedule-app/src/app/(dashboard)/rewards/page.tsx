"use client";

import { BottomNav } from "@/components/bottom-nav";
import { Star, Gift, Trophy, Lock } from "lucide-react";

export default function RewardsPage() {
    return (
        <div className="min-h-screen bg-[#FFFBF7] pb-24 font-sans">
            <header className="pt-14 px-6 mb-8">
                <h1 className="text-3xl font-black text-stone-800">나의 보물상자 🎁</h1>
                <p className="text-stone-400 font-bold mt-2">미션을 완료하고 스티커를 모아보세요!</p>
            </header>

            <main className="px-6 space-y-8">
                {/* Current Points Card */}
                <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-[2.5rem] p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-yellow-100 font-bold text-sm">현재 모은 포인트</span>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-5xl font-black">1,250</span>
                            <span className="text-xl font-bold mb-2">P</span>
                        </div>
                    </div>
                    <Star className="absolute -right-6 -bottom-6 w-40 h-40 text-white/20 rotate-12" />
                </div>

                {/* Sticker Board */}
                <div>
                    <h2 className="text-xl font-extrabold text-stone-800 mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6 text-yellow-500" />
                        이번 달 스티커
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="aspect-square bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-4xl animate-in zoom-in duration-500 delay-100">
                                ⭐
                            </div>
                        ))}
                        {[6, 7, 8, 9].map((i) => (
                            <div key={i} className="aspect-square bg-stone-100 rounded-2xl border border-dashed border-stone-200 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-stone-300" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wishlist */}
                <div>
                    <h2 className="text-xl font-extrabold text-stone-800 mb-4 flex items-center gap-2">
                        <Gift className="w-6 h-6 text-pink-400" />
                        받고 싶은 선물
                    </h2>
                    <div className="bg-white rounded-[2rem] p-6 border border-stone-50 flex items-center gap-4">
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl">
                            🎮
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-stone-800">닌텐도 게임칩</h3>
                            <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden w-32">
                                <div className="bg-pink-400 h-full w-[60%]" />
                            </div>
                            <span className="text-[10px] text-stone-400 font-bold mt-1 block">60% 달성!</span>
                        </div>
                    </div>
                </div>
            </main>

            <BottomNav activeTab="rewards" onTabChange={() => { }} />
        </div>
    );
}
