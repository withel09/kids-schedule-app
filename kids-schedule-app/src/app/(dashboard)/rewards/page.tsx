"use client";

import { BarChart2, TrendingUp, Award, Calendar } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useState } from "react";

export default function RewardsPage() {
    const [viewMode, setViewMode] = useState("Weekly");

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] p-6 pb-24">
            <div className="pt-4 flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-[#2D3648]">Statistics</h1>
                <button className="p-3 rounded-full bg-white shadow-sm text-gray-500">
                    <Calendar className="w-5 h-5" />
                </button>
            </div>

            <SegmentedControl
                options={["Daily", "Weekly", "Monthly"]}
                selected={viewMode}
                onSelect={setViewMode}
            />

            {/* Overall Card */}
            <div className="bg-[#D4E8B0] rounded-[32px] p-8 mb-6 relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                    <h3 className="text-[#4A644E] font-bold text-lg mb-1">Total Habits Completed</h3>
                    <p className="text-5xl font-black text-[#2D3648]">128</p>
                </div>
                <Award className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/30" />
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-6 rounded-[24px] shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase">Consistency</p>
                    <p className="text-2xl font-black text-gray-800">85%</p>
                </div>
                <div className="bg-white p-6 rounded-[24px] shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-3">
                        <Award className="w-5 h-5" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase">Best Streak</p>
                    <p className="text-2xl font-black text-gray-800">12 Days</p>
                </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm flex-1">
                <h3 className="font-bold text-gray-800 mb-6">Activity</h3>
                <div className="h-40 flex items-end justify-between gap-2">
                    {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                        <div key={i} className="w-full bg-gray-100 rounded-t-xl relative group">
                            <div
                                className="absolute bottom-0 left-0 right-0 bg-[#2D3648] rounded-t-xl transition-all group-hover:bg-[#96B23C]"
                                style={{ height: `${h}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>
        </div>
    );
}
