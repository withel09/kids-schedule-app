"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) {
                    alert("가입 에러: " + error.message);
                    throw error;
                }

                // If confirm email is OFF, we get a session immediately.
                if (data.session) {
                    router.push("/dashboard");
                } else {
                    alert("회원가입 확인 메일을 보냈습니다! 이메일을 확인해주세요.");
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) {
                    alert("로그인 에러: " + error.message);
                    throw error;
                }
                router.push("/dashboard");
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            if (!err.message.includes("가입 에러") && !err.message.includes("로그인 에러")) {
                alert("시스템 에러: " + err.message);
            }
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
            <Card className="w-full max-w-md shadow-lg border-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-stone-900">
                        {isSignUp ? "회원가입" : "로그인"}
                    </CardTitle>
                    <CardDescription>
                        우리아이 스케줄 관리를 시작해보세요
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="이메일"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="rounded-xl h-12 bg-stone-50"
                            />
                            <Input
                                type="password"
                                placeholder="비밀번호"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="rounded-xl h-12 bg-stone-50"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 rounded-xl text-lg font-bold bg-stone-900 hover:bg-stone-800"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isSignUp ? "가입하기" : "로그인")}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-stone-500 hover:text-stone-800 underline underline-offset-4"
                        >
                            {isSignUp ? "이미 계정이 있으신가요? 로그인" : "계정이 없으신가요? 회원가입"}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
