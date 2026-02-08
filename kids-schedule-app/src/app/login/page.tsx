"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2ED] flex flex-col items-center justify-center p-6 font-sans">
            {/* Container matching the card style of the dashboard */}
            <div className="w-full max-w-md bg-white rounded-[40px] shadow-xl overflow-hidden p-8 md:p-12 relative">

                {/* Decorative Shape */}
                <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[80%] bg-[#D4E8B0] rounded-full blur-3xl opacity-30 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Logo Area */}
                    <div className="w-24 h-24 bg-[#2D3648] rounded-[32px] flex items-center justify-center mb-6 shadow-lg rotate-[-6deg]">
                        <span className="text-5xl">🐣</span>
                    </div>

                    <h1 className="text-3xl font-black text-[#2D3648] mb-2">Kids Schedule</h1>
                    <p className="text-gray-400 font-bold text-sm mb-10">Smart routine manager for moms</p>

                    <form onSubmit={handleLogin} className="w-full space-y-4">
                        <div className="space-y-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold focus:ring-[#96B23C] focus:bg-white transition-all"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-14 rounded-2xl bg-gray-50 border-gray-100 font-bold focus:ring-[#96B23C] focus:bg-white transition-all"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 rounded-2xl bg-[#2D3648] hover:bg-[#1a202c] text-white text-lg font-bold shadow-lg mt-6 group transition-all"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : (
                                <span className="flex items-center gap-2">
                                    Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 flex gap-2 text-sm font-bold text-gray-400">
                        <p>New here?</p>
                        <button className="text-[#96B23C] hover:underline">Create Account</button>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-xs font-bold text-gray-300">© 2024 Kids Schedule Manager</p>
        </div>
    );
}
