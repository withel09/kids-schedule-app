import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Temporary Bypass for UI Review
    // if (!user) {
    //   redirect("/login");
    // }
    const userId = user?.id || "demo-user"; // Fallback ID

    // Fetch Schedules
    const { data: schedules } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: true });

    // Fetch Children (for onboarding modal check)
    let { data: children } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", userId);

    // DUMMY DATA FOR PREVIEW
    let displaySchedules = schedules || [];
    let displayChildren = children || [];

    if (userId === "demo-user") {
        displayChildren = [{ id: "child-1", name: "지수", gender: "F", birthday: "2018-01-01", user_id: "demo", created_at: "" }];
        displaySchedules = [
            { id: "1", title: "학교 가기", start_time: new Date().toISOString().split('T')[0] + "T08:30:00", day_of_week: [1, 2, 3, 4, 5], category: "study", is_completed: true, user_id: "demo", created_at: "", description: "" },
            { id: "2", title: "피아노 학원", start_time: new Date().toISOString().split('T')[0] + "T14:00:00", day_of_week: [1, 3, 5], category: "play", is_completed: false, user_id: "demo", created_at: "", description: "" },
            { id: "3", title: "책 읽기", start_time: new Date().toISOString().split('T')[0] + "T20:00:00", day_of_week: [0, 1, 2, 3, 4, 5, 6], category: "study", is_completed: false, user_id: "demo", created_at: "", description: "" },
        ];
    }

    return (
        <DashboardView
            initialSchedules={displaySchedules}
            initialChildren={displayChildren}
            userId={userId}
        />
    );
}
