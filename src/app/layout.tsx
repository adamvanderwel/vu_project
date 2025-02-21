import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vandebron - Energiebron Dashboard",
  description: "Monitor and manage your energy assets in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-[#fafafa]">
          <TopNav />
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
