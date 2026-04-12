import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo 4 — Progressive GenUI",
  description: "Static preview ngay lập tức → Upgrade to interactive React",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased text-white bg-[#0D0D0D]">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
