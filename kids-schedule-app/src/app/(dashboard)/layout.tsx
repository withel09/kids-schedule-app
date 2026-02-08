import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F0F2ED] text-gray-900 pb-24 font-sans">
            {/* Background color matched to photo (Soft Beige/Gray) */}

            <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl overflow-hidden relative">
                {/* Constrain width to mobile size (max-w-md) to look like an app on desktop */}
                {children}
            </main>

            <BottomNav />
        </div>
    );
}
