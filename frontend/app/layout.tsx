import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexVault AI — Secure Institutional Legal Knowledge Platform",
  description: "Capture, sanitize, abstract, and safely retrieve institutional legal expertise with an 8-stage guardrailed AI pipeline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-content-primary antialiased">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-h-[calc(100vh-4rem)] p-6 md:p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
