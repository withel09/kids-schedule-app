import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google"; // Use Noto Sans KR for Korean support
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "Kids Schedule Manager",
  description: "Smart routine manager for moms and kids",
  manifest: "/manifest.json",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${notoSansKr.className} antialiased bg-stone-50 text-stone-900`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
