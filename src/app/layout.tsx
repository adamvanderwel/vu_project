import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Energy Source Dashboard",
  description: "Monitor and manage your energy assets in real-time",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-[#fafafa]">
          <TopNav />
          <main className="w-full max-w-[100vw] overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
