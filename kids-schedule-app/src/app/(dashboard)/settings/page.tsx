"use client";

import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
    const menuItems = [
        { icon: User, label: "My Profile", color: "text-blue-500 bg-blue-50" },
        { icon: Bell, label: "Notification", color: "text-orange-500 bg-orange-50" },
        { icon: Shield, label: "Security", color: "text-green-500 bg-green-50" },
        { icon: HelpCircle, label: "Help Center", color: "text-purple-500 bg-purple-50" },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#F8F9FA] p-6 pb-24">
            <div className="pt-4 flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-[#2D3648]">Profile</h1>
                <button className="p-3 rounded-full bg-white shadow-sm text-gray-500">
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-[32px] p-6 mb-8 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 overflow-hidden relative">
                    {/* Avatar Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">👩</div>
                </div>
                <h2 className="text-xl font-bold text-gray-900">제제 맘</h2>
                <p className="text-gray-400 text-sm font-medium">supermom@example.com</p>
            </div>

            {/* Menu List */}
            <div className="bg-white rounded-[32px] p-4 shadow-sm space-y-2">
                {menuItems.map((item) => (
                    <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-gray-700">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                    </button>
                ))}

                <div className="h-px bg-gray-50 my-2 mx-4" />

                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-red-500 bg-red-50">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-red-500">Log Out</span>
                    </div>
                </button>
            </div>
        </div>
    );
}
