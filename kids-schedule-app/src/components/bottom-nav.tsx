"use client";

import Link from "next/link";
import { Home, Calendar, Trophy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
    activeTab: string;
    onTabChange?: (tab: string) => void;
}

export function BottomNav({ activeTab }: BottomNavProps) {
    const tabs = [
        { id: "home", label: "홈", icon: Home, href: "/dashboard" },
        { id: "schedule", label: "전체 일정", icon: Calendar, href: "/schedule" },
        { id: "rewards", label: "보상", icon: Trophy, href: "/rewards" },
        { id: "settings", label: "설정", icon: Settings, href: "/settings" },
    ];

    return (
        <nav className="fixed bottom-6 left-6 right-6 bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 z-40">
            <div className="flex justify-around items-center">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="flex-1"
                        >
                            <div className={cn(
                                "flex flex-col items-center justify-center py-3 rounded-[2rem] transition-all duration-300",
                                isActive ? "bg-stone-900 text-white scale-105 shadow-lg" : "text-stone-400 hover:bg-stone-100"
                            )}>
                                <tab.icon className={cn("w-6 h-6 mb-1", isActive && "animate-pulse")} />
                                <span className="text-[10px] font-bold">{tab.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
