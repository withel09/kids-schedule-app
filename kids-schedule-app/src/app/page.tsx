import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFBF7] p-4">
      <h1 className="text-3xl font-black text-stone-900 mb-4">키즈 스케줄 앱 🏠</h1>
      <p className="text-stone-600 mb-8">환영합니다! 아래 버튼을 눌러주세요.</p>
      <Link
        href="/dashboard"
        className="bg-stone-900 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:bg-stone-800 transition-all"
      >
        대시보드로 입장 🚀
      </Link>
    </div>
  );
}
