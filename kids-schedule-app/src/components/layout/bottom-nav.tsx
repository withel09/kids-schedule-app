"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, MessageCircle, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/rewards", icon: BarChart2, label: "Rewards" }, // Was Insight, mapping to Rewards
        // { href: "/community", icon: MessageCircle, label: "Community" }, // Placeholder - Hide for now or keep as Coming Soon
        { href: "/settings", icon: Settings, label: "Settings" }, // Was Profile
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe pt-2 px-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] rounded-t-3xl">
            <div className="flex justify-between items-center max-w-md mx-auto h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex flex-col items-center justify-center w-12 gap-1 group"
                        >
                            <div
                                className={cn(
                                    "p-2 rounded-xl transition-all duration-300",
                                    isActive
                                        ? "bg-[#D4E8B0] text-[#4A644E]" // Warm Green accent from photo
                                        : "text-gray-400 hover:bg-gray-50"
                                )}
                            >
                                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            </div>
                            {/* Optional Label - Hidden for cleaner look like photo, or verify preference? 
                  Photo shows Text labels: Test, Routine, Article, Mood. 
                  Let's keeping icons for now. */}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
