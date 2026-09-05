import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bluemace.xyz | صفحتك الشخصية مع خلفية فيديو",
  description: "أنشئ صفحتك الشخصية في ثوانٍ مع خلفية فيديو وروابطك في مكان واحد. سجّل عبر Discord أو Google.",
  keywords: ["bluemace", "link in bio", "صفحة شخصية", "خلفية فيديو", "روابط", "تخصيص"],
  authors: [{ name: "bluemace.xyz" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "bluemace.xyz | صفحتك الشخصية مع خلفية فيديو",
    description: "أنشئ صفحتك الشخصية في ثوانٍ مع خلفية فيديو وروابطك في مكان واحد.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bluemace.xyz | صفحتك الشخصية مع خلفية فيديو",
    description: "أنشئ صفحتك الشخصية في ثوانٍ مع خلفية فيديو وروابطك في مكان واحد.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="ltr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
